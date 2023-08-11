import { Route } from './@shared/interface/route.interface'
import express, { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import mongoose from 'mongoose';
import * as dotenv from "dotenv";
import metaOrgModel from './@shared/model/metadata-org.model';

class App {
    public app: express.Application;
    public port: (string | number);
    public env: boolean;

    constructor(routes: Array<Route>) {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.env = process.env.NODE_ENV === 'production' ? true : false;

        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        const metaEmitter = metaOrgModel.watch();
        metaEmitter.on('change', (data) => {
            console.log('meta data ', JSON.stringify(data));
        });
        // this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 App listening on the port ${this.port}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Headers",
                "*"
            );
            if (req.method == 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
                return res.status(200).json({});
            }
            next();
        });
    }

    private initializeRoutes(routes: Array<Route>) {
        routes.forEach((route) => {
            this.app.use('/api', route.router);
        });
    }

    // private initializeErrorHandling() {
    //     this.app.use(errorMiddleware);
    // }

    private connectToDatabase() {
        dotenv.config();
        const url = process.env.DB_URL as string;
        mongoose.connect(url);
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error: "));
        db.once("open", function () {
            console.log("Connected successfully");
        });
    }
}

export default App;
