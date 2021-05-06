import express, { Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import * as dotenv from 'dotenv';
import { sequelize } from "./core/sequelize";
import { authRoutes } from "./auth/routes";
import session from 'express-session';
import passport from "passport";
const io = require('socket.io');
import * as bodyParser from 'body-parser';
import cors from 'cors';
import { usersRoutes } from "./users/routes";
import { initPassportConfiguration } from "./auth/passport/passport";

export interface IActiveSocket {
    id: string;
    data: string;
}

export class Server {
    private httpServer: HTTPServer;
    private app: Application;
    private io: SocketIOServer;
    private activeSockets: IActiveSocket[] = [];

    private readonly DEFAULT_PORT = process.env.PORT || "5000";

    constructor() {
        this.loadDotEnvConfig();
        this.initialize();
        this.configureApp();
        this.handleSocketConnection();
    }

    private initialize(): void {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = io(this.httpServer, {
            cors: {
                origins: ['http://localhost:4200']
            }
        });
        sequelize.instance();
    }

    private handleSocketConnection(): void {
        this.io.on("connection", (socket) => {
            socket.on("disconnect", () => {
                this.activeSockets = this.activeSockets.filter(
                  (existingSocket) => existingSocket.id !== socket.id
                );
                socket.broadcast.emit("remove-user", {
                    socketId: socket.id,
                });
            });

            socket.on("call-user", (data) => {
                socket.to(data.to).emit("call-made", {
                    offer: data.offer,
                    socket: socket.id,
                });
            });

            socket.on("incoming-message", (data) => {
                socket.broadcast.emit("incoming-message", data);
            });

            socket.on("make-answer", (data) => {
                socket.to(data.to).emit("answer-made", {
                    socket: socket.id,
                    answer: data.answer,
                });
            });

            const existingSocket = this.activeSockets.find(
              (existingSocket) => existingSocket.id === socket.id
            );

            if (!existingSocket) {
                this.activeSockets.push({id: socket.id, data: JSON.parse(socket.handshake.query.data as string)});

                socket.emit("update-user-list", {
                    users: this.activeSockets.filter(
                      (existingSocket) => existingSocket.id !== socket.id
                    ),
                });

                socket.broadcast.emit("update-user-list", {
                    users: this.activeSockets.filter(
                        (existingSocket) => existingSocket.id !== socket.id)
                });
            }
        });
    }

    public listen(callback: (port: string) => void): void {
        this.httpServer.listen(this.DEFAULT_PORT, () =>
          callback(this.DEFAULT_PORT)
        );
    }

    private configureApp(): void {
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(bodyParser.json({limit: '5mb'}));
        this.app.use(session({ secret: 'anything' }));
        this.app.use(cors({
            allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token",
                'Authorization', 'Uppy-Auth-Token'],
            credentials: true,
            methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
            origin: process.env.FRONT_END_URL,
            preflightContinue: false
        }));
        this.app.use(passport.initialize());
        initPassportConfiguration();
        this.app.use(passport.session());
        this.app.use('/users', passport.authenticate('jwt', {session: false}),  usersRoutes);
        this.app.use('/', authRoutes);
    }

    private loadDotEnvConfig() {
        const config = dotenv.config();

        if (config.error) {
            throw config.error;
        }
    }
}
