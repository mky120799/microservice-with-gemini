import { Controller, Post, Body, Get, Param, Put, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TicketingService } from './ticketing.service';
import { TicketStatus, TicketPriority } from './entities/ticket.entity';
import { NotAuthorizedError, ForbiddenError } from 'common';
import type { Request } from 'express';

@Controller('api/tickets')
export class TicketingController {
  constructor(private readonly ticketingService: TicketingService) {}

  @Post()
  @UseInterceptors(FileInterceptor('attachment', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async createTicket(
    @Body() body: any,
    @UploadedFile() file: any,
    @Req() req: Request
  ) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    console.log(`--- Ticket Submission by ${req.currentUser.email} ---`);
    const { title, description, priority, category } = body;
    
    return this.ticketingService.createTicket(
      req.currentUser.id,
      title,
      description,
      priority as TicketPriority,
      category,
      file ? `/api/tickets/attachments/${file.filename}` : undefined
    );
  }

  @Get()
  async getTickets(@Req() req: Request) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }
    return this.ticketingService.getTickets(req.currentUser.id, req.currentUser.role);
  }

  @Get('analytics')
  async getAnalytics(@Req() req: Request) {
    if (!req.currentUser || (req.currentUser.role !== 'admin' && req.currentUser.role !== 'auditor')) {
      throw new ForbiddenError();
    }
    return this.ticketingService.getAnalytics();
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string, @Req() req: Request) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }
    const ticket = await this.ticketingService.getTicketById(parseInt(id));
    
    // RBAC: Customers can only see their own tickets
    if (req.currentUser.role === 'user' && ticket.userId !== req.currentUser.id) {
      throw new ForbiddenError();
    }

    return ticket;
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus, @Req() req: Request) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    // RBAC: Only admin or employee can change status
    if (req.currentUser.role === 'user') {
      throw new ForbiddenError();
    }

    return this.ticketingService.updateTicketStatus(parseInt(id), req.currentUser.id, status);
  }

  @Put(':id/priority')
  async updatePriority(@Param('id') id: string, @Body('priority') priority: TicketPriority, @Req() req: Request) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    // RBAC: Only admin or employee can change priority
    if (req.currentUser.role === 'user') {
      throw new ForbiddenError();
    }

    return this.ticketingService.updateTicketPriority(parseInt(id), req.currentUser.id, priority);
  }
}
