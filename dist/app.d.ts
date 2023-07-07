import { Route } from './@shared/interface/route.interface';
import express from 'express';
declare class App {
    app: express.Application;
    port: (string | number);
    env: boolean;
    constructor(routes: Array<Route>);
    listen(): void;
    getServer(): express.Application;
    private initializeMiddlewares;
    private initializeRoutes;
    serveApp(): void;
    private connectToDatabase;
}
export default App;
