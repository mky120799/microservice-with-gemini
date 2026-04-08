import { Controller, Post, Body, Get, Param, Put, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TicketingService } from './ticketing.service';
import { TicketStatus, TicketPriority } from './entities/ticket.entity';
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
    console.log('--- Incoming Ticket Submission ---');
    console.log('User ID Header:', req.headers['x-user-id']);
    console.log('Body:', body);
    console.log('File:', file);

    const userId = parseInt(req.headers['x-user-id'] as string || '0');
    const { title, description, priority, category } = body;
    
    return this.ticketingService.createTicket(
      userId,
      title,
      description,
      priority as TicketPriority,
      category,
      file ? `/api/tickets/attachments/${file.filename}` : undefined
    );
  }

  @Get()
  async getTickets(@Req() req: Request) {
    const userId = parseInt(req.headers['x-user-id'] as string || '0');
    const role = req.headers['x-user-role'] as string;
    return this.ticketingService.getTickets(userId, role);
  }

  @Get('analytics')
  async getAnalytics() {
    return this.ticketingService.getAnalytics();
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return this.ticketingService.getTicketById(parseInt(id));
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus, @Req() req: Request) {
    const userId = parseInt(req.headers['x-user-id'] as string || '0');
    return this.ticketingService.updateTicketStatus(parseInt(id), userId, status);
  }

  @Put(':id/priority')
  async updatePriority(@Param('id') id: string, @Body('priority') priority: TicketPriority, @Req() req: Request) {
    const userId = parseInt(req.headers['x-user-id'] as string || '0');
    return this.ticketingService.updateTicketPriority(parseInt(id), userId, priority);
  }
}
