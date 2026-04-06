import { Request, Response } from 'express';
import prisma from '../db';

export const getTransporters = async (req: Request, res: Response): Promise<void> => {
    try {
        const buyer_id = req.query.buyer_id as string;
        if (!buyer_id) { res.status(400).json({ error: 'buyer_id required' }); return; }
        
        const transporters = await prisma.transporterRecord.findMany({
            where: { buyer_id }
        });
        res.json(transporters);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};

export const createTransporter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { buyer_id, name, email, phone } = req.body;
        const transporter = await prisma.transporterRecord.create({
            data: { buyer_id, name, email, phone }
        });
        res.status(201).json(transporter);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};

export const deleteTransporter = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.transporterRecord.delete({ where: { id } });
        res.json({ message: 'Transporter deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};
