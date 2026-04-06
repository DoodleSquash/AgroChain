import { Request, Response } from 'express';
import prisma from '../db';

export const getWarehouses = async (req: Request, res: Response): Promise<void> => {
    try {
        const buyer_id = req.query.buyer_id as string;
        if (!buyer_id) { res.status(400).json({ error: 'buyer_id required' }); return; }
        
        const warehouses = await prisma.warehouse.findMany({
            where: { buyer_id },
            include: { workers: true }
        });
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};

export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { buyer_id, name, location } = req.body;
        const warehouse = await prisma.warehouse.create({
            data: { buyer_id, name, location }
        });
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};

export const deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.warehouse.delete({ where: { id } });
        res.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};

export const addWorker = async (req: Request, res: Response): Promise<void> => {
    try {
        const { warehouse_id, name, email } = req.body;
        const worker = await prisma.warehouseWorker.create({
            data: { warehouse_id, name, email }
        });
        res.status(201).json(worker);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};

export const removeWorker = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.warehouseWorker.delete({ where: { id } });
        res.json({ message: 'Worker removed successfully' });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};

export const importWorkersCSV = async (req: Request, res: Response): Promise<void> => {
    try {
        const { warehouse_id, workers } = req.body; // workers: Array of { name, email }
        
        const createdWorkers = await prisma.warehouseWorker.createMany({
            data: workers.map((w: any) => ({
                warehouse_id,
                name: w.name,
                email: w.email
            })),
            skipDuplicates: true
        });
        
        res.json({ message: `Successfully imported ${createdWorkers.count} workers` });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};
