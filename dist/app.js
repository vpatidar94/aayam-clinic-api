"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
class App {
    constructor(routes) {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 3000;
        this.env = process.env.NODE_ENV === 'production' ? true : false;
        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        // this.serveApp();
        // this.initializeErrorHandling();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 App listening on the port ${this.port}`);
        });
    }
    getServer() {
        return this.app;
    }
    initializeMiddlewares() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "*");
            if (req.method == 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
                return res.status(200).json({});
            }
            next();
        });
    }
    initializeRoutes(routes) {
        routes.forEach((route) => {
            this.app.use('/api', route.router);
        });
    }
    serveApp() {
        if (process.env.NODE_ENV === 'production') {
            // Set static folder
            this.app.use(express_1.default.static(path.join(__dirname, '../supremerentals-web/dist')));
            this.app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../supremerentals-web/dist/index.html'));
            });
        }
    }
    // private initializeErrorHandling() {
    //     this.app.use(errorMiddleware);
    // }
    connectToDatabase() {
        dotenv.config();
        const url = process.env.DB_URL;
        mongoose_1.default.connect(url);
        const db = mongoose_1.default.connection;
        db.on("error", console.error.bind(console, "connection error: "));
        db.once("open", function () {
            console.log("Connected successfully");
        });
    }
}
exports.default = App;
