# Domain Layer Guide (Clean Architecture)

ใน Clean Architecture, **Domain Layer** (หรือ Core Layer) คือหัวใจสำคัญที่สุดของแอปพลิเคชัน เป็นชั้นที่บรรจุ "กฎเกณฑ์ทางธุรกิจ" (Enterprise Business Rules) และความรู้หลักของระบบเอาไว้ โดยมีกฎเหล็กคือ **"ห้ามขึ้นอยู่กับ (Depend on) เทคโนโลยีภายนอก เฟรมเวิร์ก ฐานข้อมูล หรือ UI เด็ดขาด"**

## โครงสร้างภายใน (Structure)

ในโฟลเดอร์ `packages/domains/src` มักจะแบ่งออกเป็นโฟลเดอร์ย่อยดังนี้:

1. **`entities/`**: กำหนดโครงสร้างข้อมูล (Data Models) และลอจิกพื้นฐานของข้อมูล
2. **`schema/`**: กำหนดกฎเกณฑ์การตรวจสอบข้อมูล (Validation) เช่น การใช้ Zod
3. **`repositories/`**: ประกาศ Interface (Contracts) ว่าการดึง/บันทึกข้อมูลต้องมีหน้าตาแบบไหน แต่จะไม่เขียนวิธีดึงข้อมูลจริงๆ ลงไป
4. **`use-cases/`** (หรือ `services/`): (บางระบบมี) เขียน Flow การทำงานหลักของธุรกิจ

---

## 1. Entities & Types (`src/entities/`)
**ความหมาย**: เป็นตัวแทนของวัตถุหลักในระบบ (เช่น User, Product, Order) 
**Pattern**: มักเขียนเป็น TypeScript `type` หรือ `interface` ที่เรียบง่าย ไม่มีลอจิกแปลกปลอม

```typescript
// packages/domains/src/entities/user.ts

export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. Validation Schemas (`src/schema/`)
**ความหมาย**: เป็นตัวยืนยันว่าข้อมูลที่วิ่งเข้ามาใน Domain นั้นถูกต้องตาม Business Rules หรือไม่ นิยมใช้ไลบรารีอย่าง `zod`
**Pattern**: แยก Validation ออกจาก Entity เพื่อให้นำไปเช็คได้ทั้งฝั่ง Frontend (ฟอร์ม) และ Backend (API)

```typescript
// packages/domains/src/schema/user.schema.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email({ message: "อีเมลไม่ถูกต้อง" }),
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  role: z.enum(['ADMIN', 'CUSTOMER']).default('CUSTOMER'),
});

// สร้าง Type จาก Schema ได้เลยเพื่อความชัวร์
export type ValidatedUser = z.infer<typeof UserSchema>;

// Schema สำหรับตอนสร้าง User ใหม่ (ไม่จำเป็นต้องมี ID เพราะ DB สร้างให้)
export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true });
```

---

## 3. Repositories Interfaces (`src/repositories/`)
**ความหมาย**: เป็นการทำ **Dependency Inversion Principle (DIP)**. Domain Layer จะแค่บอกว่า "ฉันต้องการฟังก์ชันพวกนี้นะ (Interface)" แต่หน้าที่ในการเขียนโค้ดต่อ DB จะตกเป็นของ Data Access Layer (`packages/database`)
**Pattern**: เขียนแค่ Interface เปล่าๆ

```typescript
// packages/domains/src/repositories/user.repository.interface.ts
import type { User } from '../entities/user';
import type { z } from 'zod';
import type { CreateUserSchema } from '../schema/user.schema';

export interface IUserRepository {
  /** ค้นหาผู้ใช้ด้วย ID */
  findById(id: string): Promise<User | null>;
  
  /** ค้นหาผู้ใช้ด้วย Email */
  findByEmail(email: string): Promise<User | null>;
  
  /** สร้างผู้ใช้ใหม่ */
  create(data: z.infer<typeof CreateUserSchema>): Promise<User>;
  
  /** ลบผู้ใช้ */
  delete(id: string): Promise<boolean>;
}
```

### ทำไมต้องทำแบบนี้? (Why this Pattern?)
สมมติว่าวันหนึ่งคุณเปลี่ยนใจ เปลี่ยนจาก **PostgreSQL (Drizzle)** ไปใช้ **MongoDB** ตัว Domain Layer จะ **ไม่กระทบเลยแม้แต่บรรทัดเดียว** เพราะ Domain รู้จักแค่ Interface `IUserRepository` เท่านั้น

---

## 4. Use Cases / Domain Services (`src/use-cases/` - *Optional*)
**ความหมาย**: เป็นที่รวม Business Logic ที่ต้องใช้ Entity + Repository มารวมกัน
**Pattern**: สร้าง Class หรือ Function ที่รับ Repository เข้ามา (Dependency Injection)

```typescript
// packages/domains/src/use-cases/register-user.ts
import { IUserRepository } from '../repositories/user.repository.interface';
import { CreateUserSchema } from '../schema/user.schema';
import { z } from 'zod';

export class RegisterUserUseCase {
  // รับ Repository เข้ามาผ่าน Constructor (Dependency Injection)
  constructor(private userRepository: IUserRepository) {}

  async execute(input: z.infer<typeof CreateUserSchema>) {
    // 1. Validate ข้อมูลตาม Business Rule
    const validatedData = CreateUserSchema.parse(input);

    // 2. ตรวจสอบว่ามีอีเมลนี้ในระบบหรือยัง
    const existingUser = await this.userRepository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }

    // 3. บันทึกข้อมูล
    const user = await this.userRepository.create(validatedData);
    
    // 4. (ถ้ามี) ส่งอีเมลต้อนรับ (เรียกใช้อินเตอร์เฟส Email Service จาก Infrastructure)
    
    return user;
  }
}
```

## บทสรุปของ Domain Layer Pattern
- **Input/Output เป็นมาตรฐาน**: รับข้อมูลเข้ามาเป็น Plain Object (หรือ Zod Data)
- **ไม่รู้จักเครื่องมือภายนอก**: ไม่มีคำสั่ง `import { db } from 'database'` หรือ `import { fetch } from '...'`
- **เป็นอิสระ**: สามารถเขียน Unit Test (`vitest`, `jest`) ได้ง่ายมาก เพราะแค่ Mock (จำลอง) ตัว Interface Repository ส่งเข้าไปใน Use Case ก็เทสต์ Business Logic ได้ทันทีโดยไม่ต้องต่อฐานข้อมูลจริง
