
/* 
 * 載入 Prisma 根據 schema.prisma 自動產生的資料庫 Client。
 * 這個路徑來自 schema.prisma 裡設定的 output = "../src/generated/prisma"。
 */
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();

export default prisma;