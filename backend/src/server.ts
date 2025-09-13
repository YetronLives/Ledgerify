import express, { Request, Response } from 'express';

const app = express();
const PORT: number = 5000;

app.get('/', (req: Request, res: Response) => {
    res.json({ message: "Hello from Express!" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
