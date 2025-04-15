import {PrismaClient} from '@prisma/client'


export default new PrismaClient({
    transactionOptions: {
        maxWait: 100,
        timeout: 100
    }
})