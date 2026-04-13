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

import * as multer from 'multer';
import { extname, join } from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
  },
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
    
    let attachmentUrl = undefined;
    
    if (file) {
      // Primary: Local Mirror URL
      attachmentUrl = `http://localhost:8000/api/tickets/attachments/${file.filename}`;
      console.log(`[Ticketing] Local Mirror Path: ${attachmentUrl}`);

      // Secondary: Background upload to Cloudinary (as backup)
      cloudinary.uploader.upload(file.path, {
        folder: 'zenith/tickets',
        resource_type: 'auto',
        access_mode: 'public'
      }).then(result => {
        console.log(`[Ticketing] Background Cloudinary backup successful: ${result.secure_url}`);
      }).catch(err => {
        console.error('[Ticketing] Background Cloudinary backup failed:', err);
      });
    }

    const savedTicket = await this.ticketingService.createTicket(
      req.currentUser.id,
      title,
      description,
      priority as TicketPriority,
      category,
      attachmentUrl
    );

    return this.signTicket(savedTicket);
  }

  private signTicket(ticket: any) {
    if (ticket.attachmentUrl && ticket.attachmentUrl.includes('cloudinary.com')) {
      // Regex to extract public_id from Cloudinary URL
      // Handles: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.ext
      const parts = ticket.attachmentUrl.split('/');
      const uploadIdx = parts.indexOf('upload');
      if (uploadIdx !== -1) {
        // public_id is everything after the version (vXXXX) or after /upload/
        // Actually, cloudinary.url just needs the path after /upload/v12345/ or /upload/
        let publicIdWithExt = parts.slice(uploadIdx + 1).join('/');
        
        // Remove version if present (v123456)
        if (publicIdWithExt.startsWith('v')) {
          publicIdWithExt = publicIdWithExt.split('/').slice(1).join('/');
        }

        // Extract publicId, version, and extension
        const versionMatch = ticket.attachmentUrl.match(/\/v(\d+)\//);
        const version = versionMatch ? versionMatch[1] : undefined;
        
        const extension = publicIdWithExt.split('.').pop();
        const publicId = publicIdWithExt.split('.').slice(0, -1).join('.');
        const isPdf = ticket.attachmentUrl.toLowerCase().endsWith('.pdf');

        try {
          ticket.attachmentUrl = cloudinary.url(publicId, {
            sign_url: true,
            secure: true,
            resource_type: isPdf ? 'image' : 'auto',
            format: extension,
            version: version
          });
          console.log(`[Ticketing] Final Signed URL for ${publicId} (v${version}): ${ticket.attachmentUrl}`);
        } catch (err) {
          console.error('[Ticketing] Signing Error:', err);
        }
      }
    }
    return ticket;
  }


  @Get()
  async getTickets(@Req() req: Request) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }
    const tickets = await this.ticketingService.getTickets(req.currentUser.id, req.currentUser.role);
    return tickets.map(t => this.signTicket(t));
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

    return this.signTicket(ticket);
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
