import { Controller, Post, Body, Get, Param, Put, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { TicketingService } from './ticketing.service';
import { TicketStatus, TicketPriority } from './entities/ticket.entity';
import { NotAuthorizedError, ForbiddenError } from 'common';
import type { Request } from 'express';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'zenith/tickets',
    allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'txt'],
    resource_type: 'auto',
    access_mode: 'public',
  } as any,
});

const AUTHORIZED_STAFF_ROLES = ['admin', 'auditor', 'finance', 'employee'];

@Controller('api/tickets')
export class TicketingController {
  constructor(private readonly ticketingService: TicketingService) {}

  @Post()
  @UseInterceptors(FileInterceptor('attachment', { storage }))
  async createTicket(
    @Body() body: any,
    @UploadedFile() file: any,
    @Req() req: Request
  ) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    // RBAC: Customers can no longer create tickets per new requirement
    if (req.currentUser.role === 'user') {
      throw new ForbiddenError();
    }

    console.log(`--- Ticket Submission by ${req.currentUser.email} ---`);
    const { title, description, priority, category } = body;
    
    let attachmentUrl = file ? file.path || file.secure_url || file.url : undefined;
    
    // Normalize to absolute URL
    if (attachmentUrl && !attachmentUrl.startsWith('http')) {
      attachmentUrl = `http://localhost:8000/${attachmentUrl.replace(/^\//, '')}`;
    }
    
    console.log(`[Ticketing] Attachment URL: ${attachmentUrl}`);

    return this.ticketingService.createTicket(
      req.currentUser.id,
      title,
      description,
      priority as TicketPriority,
      category,
      attachmentUrl
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
    if (!req.currentUser || !AUTHORIZED_STAFF_ROLES.includes(req.currentUser.role)) {
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
    
    // RBAC: Customers can only see their own tickets, Staff can see all
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

    // RBAC: Only authorized staff can change status
    if (!AUTHORIZED_STAFF_ROLES.includes(req.currentUser.role)) {
      throw new ForbiddenError();
    }

    return this.ticketingService.updateTicketStatus(parseInt(id), req.currentUser.id, status);
  }

  @Put(':id/priority')
  async updatePriority(@Param('id') id: string, @Body('priority') priority: TicketPriority, @Req() req: Request) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    // RBAC: Only authorized staff can change priority
    if (!AUTHORIZED_STAFF_ROLES.includes(req.currentUser.role)) {
      throw new ForbiddenError();
    }

    return this.ticketingService.updateTicketPriority(parseInt(id), req.currentUser.id, priority);
  }
}
