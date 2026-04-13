import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { AuditLog } from './entities/audit-log.entity';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class TicketingService {
  private readonly logger = new Logger(TicketingService.name);

  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private rabbitMQService: RabbitMQService,
  ) {}

  // Automated Task: Runs every minute to check for stale tickets
  @Cron(CronExpression.EVERY_MINUTE)
  async handleStaleTickets() {
    this.logger.debug('[Ticketing Job] Checking for stale tickets (older than 24 hours)...');

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const staleTickets = await this.ticketRepository.find({
      where: {
        status: TicketStatus.OPEN,
        createdAt: LessThan(oneDayAgo)
      }
    });

    if (staleTickets.length > 0) {
      this.logger.warn(`[Ticketing Job] Found ${staleTickets.length} stale tickets that need attention!`);
      staleTickets.forEach(ticket => {
        this.logger.log(`[Ticketing Job] Ticket #${ticket.id} (${ticket.title}) is stale.`);
      });
    } else {
      this.logger.debug('[Ticketing Job] No stale tickets found.');
    }
  }

  async createTicket(userId: number, title: string, description: string, priority: TicketPriority, category?: string, attachmentUrl?: string) {
    const ticket = this.ticketRepository.create({
      userId,
      title,
      description,
      priority,
      category,
      attachmentUrl,
      status: TicketStatus.OPEN,
    });
    
    const savedTicket = await this.ticketRepository.save(ticket);
    
    // Log the creation audit event
    await this.logChange(savedTicket.id, userId, 'TICKET_CREATED', null, TicketStatus.OPEN);

    // Notify other services
    await this.rabbitMQService.publish('ticket-created', savedTicket);
    
    return savedTicket;
  }

  async updateTicketStatus(ticketId: number, userId: number, newStatus: TicketStatus) {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const oldStatus = ticket.status;
    ticket.status = newStatus;
    const updatedTicket = await this.ticketRepository.save(ticket);

    // Audit log
    await this.logChange(ticketId, userId, 'status', oldStatus, newStatus);

    // Notify
    await this.rabbitMQService.publish('ticket-status-updated', updatedTicket);

    return updatedTicket;
  }

  async updateTicketPriority(ticketId: number, userId: number, newPriority: TicketPriority) {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const oldPriority = ticket.priority;
    ticket.priority = newPriority;
    const updatedTicket = await this.ticketRepository.save(ticket);

    // Audit log
    await this.logChange(ticketId, userId, 'priority', oldPriority, newPriority);

    return updatedTicket;
  }

  async getTickets(userId?: number, role?: string) {
    if (role === 'admin' || role === 'finance' || role === 'auditor') {
      return this.ticketRepository.find({ order: { createdAt: 'DESC' } });
    }
    return this.ticketRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getTicketById(id: number) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    
    const auditLogs = await this.auditLogRepository.find({ 
        where: { ticketId: id },
        order: { timestamp: 'DESC' }
    });
    
    return { ...ticket, auditLogs };
  }

  async getAnalytics() {
    const totalTickets = await this.ticketRepository.count();
    const resolvedTickets = await this.ticketRepository.count({ where: { status: TicketStatus.RESOLVED } });
    const openTickets = await this.ticketRepository.count({ where: { status: TicketStatus.OPEN } });
    const inProgressTickets = await this.ticketRepository.count({ where: { status: TicketStatus.IN_PROGRESS } });

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0
    };
  }

  private async logChange(ticketId: number, userId: number, fieldChanged: string, oldValue: any, newValue: any) {
    const log = this.auditLogRepository.create({
      ticketId,
      changedByUserId: userId,
      fieldChanged,
      oldValue: oldValue ? String(oldValue) : null as any,
      newValue: newValue ? String(newValue) : null as any,
    });
    await this.auditLogRepository.save(log);
  }
}
