import dotenv from 'dotenv';
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserService from "../services/UserService.ts";

dotenv.config();

interface CustomRequest extends Request {
  userid?: string;
  userObject?: object;
}

const AuthMiddlewareUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).send("Unauthorized");
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2) {
      return res.status(401).send("Unauthorized");
    }

    const [schema, token] = parts;
    if (schema !== "Bearer") {
      return res.status(401).send("Unauthorized");
    }

    jwt.verify(
      token,
      process.env.SECRET_KEY_JWT!,
      async (error, decoded) => {
        if (error) {
          return res.status(401).send("Token Inválido");
        }

        const payload = decoded as JwtPayload;
        const userId = payload?.id;

         if (!userId) {
          return res.status(400).send("Nenhum usuário encontrado");
        } 

         const user = await UserService.FindUserByIdService(userId);

         if (!user || !user.id) {
            return res.status(400).send("Nenhum usuário encontrado");
        } 

        req.userid = userId;
        req.userObject = user; 
        next();
      }
    );
  } catch (err) {
    res.status(500).send("Falha ao iniciar sessão");
  }
};

export default AuthMiddlewareUser;