import { DataSource } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { AuditLog } from './entities/audit-log.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USER || 'zenith_user',
  password: process.env.DB_PASSWORD || 'zenith_password',
  database: process.env.DB_NAME || 'zenith_bank',
  entities: [Ticket, AuditLog],
  synchronize: true,
});

const seed = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Connected to PostgreSQL for ticketing seed');

        const ticketRepository = AppDataSource.getRepository(Ticket);
        const auditLogRepository = AppDataSource.getRepository(AuditLog);

        const exampleTickets = [
            {
                userId: 2, // user@zenith.com
                title: 'Loan Disbursement Stuck',
                description: 'The loan was approved but the funds have not reached my account.',
                priority: TicketPriority.URGENT,
                category: 'Loan Issues',
            },
            {
                userId: 4, // mky120799@gmail.com
                title: 'Transaction Failed: Payment Not Reflected',
                description: 'I tried to send $100 but it failed and the amount was deducted.',
                priority: TicketPriority.HIGH,
                category: 'Transaction Error',
            },
            {
                userId: 5, // oky120799@gmail.com
                title: 'KYC Verification Pending',
                description: 'I uploaded my ID 3 days ago. How long does verification take?',
                priority: TicketPriority.LOW,
                category: 'KYC Verification',
            }
        ];

        for (const t of exampleTickets) {
            const existing = await ticketRepository.findOne({ where: { title: t.title } });
            if (existing) {
                console.log(`Ticket "${t.title}" already exists, skipping.`);
                continue;
            }

            const ticket = ticketRepository.create(t);
            const savedTicket = await ticketRepository.save(ticket);

            const log = auditLogRepository.create({
                ticketId: savedTicket.id,
                changedByUserId: t.userId,
                fieldChanged: 'TICKET_CREATED',
                newValue: TicketStatus.OPEN,
            });
            await auditLogRepository.save(log);
            console.log(`Created ticket: ${t.title}`);
        }

        console.log('Ticketing seed completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Ticketing seed failed:', err);
        process.exit(1);
    }
};

seed();
