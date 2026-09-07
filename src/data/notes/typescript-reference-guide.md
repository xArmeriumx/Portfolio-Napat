# TypeScript Mastery: The Complete Reference Guide

เอกสารอ้างอิงและสรุปแนวคิดทั้งหมดที่ได้จากการเรียนรู้และการเขียนโค้ดในโปรเจกต์นี้ 

---

## 1. การกำหนดประเภทข้อมูลพื้นฐาน (Primitive Types & Basic Typing)
เริ่มต้นด้วยการกำหนดประเภทข้อมูลเบื้องต้นและการเตรียมโครงสร้างข้อมูล ซึ่งถือเป็นรากฐานของการเขียน TypeScript

### Type vs Interface
เราสามารถกำหนดโครงสร้าง Object ได้สองวิธีหลัก ซึ่งมีจุดประสงค์แตกต่างกัน:

**Type Alias (`type`)**: 
- เหมาะสำหรับการสร้าง Union Types, Intersection Types หรือการกำหนดค่า Literal แบบตายตัว
- มีความยืดหยุ่นสูงในระดับของ Primitive value

```typescript
// การทำ Union Type: รองรับค่าสองรูปแบบ
type ProductIdentifier = string | number;

// การทำ Literal Type: บังคับค่าเฉพาะเจาะจง
type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

// การรวม Type หลายอันเข้าด้วยกัน
type ContactInfo = { email: string } | { phone: string };

const status: OrderStatus = "Processing";
const contact: ContactInfo = { email: "test@example.com" };

console.log("Status:", status);
console.log("Contact:", contact);
```

**Interface (`interface`)**:
- เหมาะสำหรับการกำหนดโครงสร้างของ Object แบบเต็มรูปแบบ เช่น โครงสร้างของข้อมูลที่มาจาก Database หรือ โครงสร้างของ Class
- สามารถทำ Declaration Merging (การประกาศชื่อเดิมซ้ำเพื่อเพิ่ม Property ได้) ซึ่งมีประโยชน์มากเมื่อทำ Library

```typescript
interface UserProfile {
    id: number;
    username: string;
    isActive: boolean;
    // ใช้เครื่องหมาย ? เพื่อบอกว่ามีหรือไม่มีก็ได้ (Optional)
    avatarUrl?: string; 
}

// การขยาย Interface (Inheritance/Extends)
interface AdminProfile extends UserProfile {
    adminLevel: number;
}

const admin: AdminProfile = {
    id: 1,
    username: "superadmin",
    isActive: true,
    adminLevel: 99
};

console.log("Admin Object:", admin);
```

---

## 2. การรวมประเภทข้อมูล (Advanced Types Structure)

### Intersection Types (&)
การใช้เครื่องหมาย `&` เป็นการรวบรวมคุณสมบัติทั้งหมดจาก Type หรือ Interface ทุกตัวที่นำมารวมกัน (AND Logic)

```typescript
type EditableEntity = {
    updatedAt: Date;
    updatedBy: string;
};

type Content = {
    title: string;
    body: string;
};

// Article ต้องมีคุณสมบัติครบทั้ง 4 ตัวจาก EditableEntity และ Content
type Article = EditableEntity & Content;

const newArticle: Article = {
    title: "TypeScript Guide",
    body: "Content goes here...",
    updatedAt: new Date(),
    updatedBy: "Admin101"
};

console.log("Created Article (Intersection Type):");
console.log(newArticle);
```

---

## 3. การคัดกรองและความปลอดภัยของประเภท (Type Narrowing)
TypeScript มีความเข้มงวด เมื่อใช้งานตัวแปรที่มีหลายประเภท (Union Types) เราไม่สามารถเรียกใช้ Method ของประเภทใดประเภทหนึ่งได้ทันที จนกว่าจะรับประกันได้ว่าตัวแปรนั้นคือประเภทนั้นจริงๆ

### 3.1 การใช้ `typeof` (สำหรับ Primitive)
```typescript
function processInput(input: string | number) {
    if (typeof input === "string") {
        // ในบล็อกนี้ TypeScript ทราบแน่ชัดว่า input คือ string
        return input.trim().toLowerCase();
    } else {
        // ในบล็อกนี้ input คือ number แน่นอน
        return input.toFixed(2);
    }
}

console.log("Result (string):", processInput("  Hello TS   "));
console.log("Result (number):", processInput(99.1234));
```

### 3.2 การใช้เครื่องหมาย `in` (สำหรับ Object)
ใช้ตรวจสอบว่ามี Property ชื่อนี้อยู่ภายใน Object หรือไม่ มักใช้แยกระหว่าง Interface ที่มีคุณสมบัติต่างกัน

```typescript
interface Car { drive: () => void; wheels: 4; }
interface Boat { sail: () => void; engine: string; }

function startVehicle(vehicle: Car | Boat) {
    // เช็คว่ามี property 'drive' อยู่ใน vehicle หรือไม่
    if ("drive" in vehicle) {
        vehicle.drive(); // TypeScript รู้ว่าเป็น Car
    } else {
        vehicle.sail(); // ถ้าไม่มี ต้องเป็น Boat
    }
}

const myCar: Car = { drive: () => console.log("Driving a car! vroom💨"), wheels: 4 };
const myBoat: Boat = { sail: () => console.log("Sailing a boat! 🌊"), engine: "V8" };

startVehicle(myCar);
startVehicle(myBoat);
```

---

## 4. โครงสร้าง Object แบบไม่คงที่ (Dynamic Objects & Index Signatures)
เมื่อเราต้องการสร้าง Object เป็น Dictionary หรือ Map ที่เราไม่ทราบชื่อ Key ล่วงหน้า แต่เราทราบประเภทของ Key และ Value

```typescript
// Index Signature
interface TranslationDictionary {
    // บังคับว่า Key จะต้องเป็น string และ Value จะต้องเป็น string
    [languageCode: string]: string;
}

const greetings: TranslationDictionary = {
    en: "Hello",
    th: "สวัสดี",
    jp: "こんにちは"
};

console.log("All greetings in Dictionary:");
Object.keys(greetings).forEach(key => {
    console.log(`[${key}]: ${greetings[key]}`);
});
```

---

## 5. การจัดการสิทธิ์และการอ้างอิงตัวเอง (keyof & typeof)

### Typeof Operator
ใช้ดึง Type โครงสร้างออกมาจาก Object ที่ถูกสร้างไปแล้ว
```typescript
const AppConfig = {
    theme: "dark",
    maxUsers: 100,
    apiUrl: "https://api.example.com"
};

// ดึงโครงสร้างออกมาเป็น Type
type ConfigType = typeof AppConfig;

console.log("App Theme Config:", AppConfig.theme);
```

### Keyof Operator
ใช้ดึงรายชื่อ Key ทั้งหมดที่อยู่ใน Type นั้น ออกมาเป็น Literal Union Type
```typescript
interface Employee {
    id: string;
    name: string;
    department: string;
}

// จะได้ค่าเป็น "id" | "name" | "department"
type EmployeeKeys = keyof Employee;

// ประยุกต์ใช้เพื่อความปลอดภัย: ป้องกันการส่งชื่อ Key ผิด
function getEmployeeProperty(emp: Employee, key: keyof Employee) {
    return emp[key];
}

const emp: Employee = { id: "E01", name: "Bob", department: "IT" };
console.log("Extracted Property (name):", getEmployeeProperty(emp, "name"));
console.log("Extracted Property (department):", getEmployeeProperty(emp, "department"));
```

---

## 6. ความยืดหยุ่นที่ปลอดภัยแบบสููงสุด (Generics: <T>)
Generics คล้ายกับการสร้างตัวแปรสำหรับ Type ใช้เพื่อทำให้ Function หรือ Class สามารถรับ Type อะไรก็ได้เข้ามา แต่คงความเชื่อมโยงของ Type ตั้งแต่ต้นจนจบ

```typescript
// ฟังก์ชันนี้รับ Data รูปแบบไหน ก็จะคืนค่าเป็น Data รูปแบบเดิมกลับไป พร้อมกับแนบ Status
function wrapWithStatus<T>(data: T, status: string) {
    return {
        data: data,
        status: status,
        timestamp: new Date()
    };
}

const userResult = wrapWithStatus({ name: "John" }, "Success");
// userResult.data.name ใช้งานได้โดยไม่แจ้ง Error เพราะระบบจดจำ Type ตั้งแต่ตอนส่งเข้าไป

console.log("Generic Result:");
console.log(JSON.stringify(userResult, null, 2));
```

---

## 7. เครื่องมือจัดการตัวแปรที่มีประสิทธิภาพสูง (Utility Types)
Utility Types คือการนำ Type เดิมที่มีอยู่แล้วมาดัดแปลงแก้ไขให้เกิดเป็น Type ใหม่ ลดการเขียนโค้ดซ้ำซ้อน

### 7.1 Partial (แปลงทุก Property ให้เป็น Optional)
มักใช้สำหรับการอัปเดตข้อมูล (Update/Patch) ที่เราไม่ต้องการส่งข้อมูลไปทั้งหมด
```typescript
interface UserData { id: number; username: string; email: string; }

function updateUser(userId: number, changes: Partial<UserData>) {
    // 'changes' อาจจะมีแค่ { email: "new@email.com" } ก็ได้
    // ไม่เกิด Error แม้จะไม่ส่ง id หรือ username มา
    console.log(`Updating user ${userId} with changes:`, changes);
    return true;
}

updateUser(101, { email: "new_alice@domain.com" });
```

### 7.2 Pick (เลือกหยิบมาเฉพาะบาง Property)
ใช้ในการกรองข้อมูลเพื่อส่งไปให้ฟังก์ชันที่ต้องการข้อมูลแค่นั้นจริงๆ เพื่อลดข้อมูลส่วนเกิน
```typescript
// เลือกมาเฉพาะ 'username' และ 'email'
type UserContactInfo = Pick<UserData, 'username' | 'email'>;

const contact: UserContactInfo = {
    username: "alice",
    email: "alice@domain.com"
};

console.log("Picked Contact Info:", contact);
```

### 7.3 Omit (เอาทุกอย่าง ยกเว้นสิ่งที่ระบุ)
ตรงข้ามกับ Pick ใช้ลบตัวที่เราไม่ต้องการออก ส่วนใหญ่ใช้บ่อยตอนสร้างฐานข้อมูล (เพราะตอนสร้าง ยังไม่มี ID)
```typescript
// เอาทุกอย่างจาก UserData ยกเว้น 'id'
type UserCreationPayload = Omit<UserData, 'id'>;

function registerNewUser(payload: UserCreationPayload) {
    // ไม่เกิด Error ถึงแม้เราจะไม่ได้ส่ง 'id' เข้ามาใน Payload
    console.log("Registering new user:", payload);
}

registerNewUser({ username: "bob", email: "bob@domain.com" });
```

### 7.4 Record (จับคู่ Key ที่จำกัด กับ Value ที่กำหนด)
เป็นเครื่องมือทำ Dictionary ที่เคร่งครัดกว่า Index Signature
```typescript
type ApplicationRole = "Admin" | "Editor" | "Viewer";

// បังคับว่าต้องมีค่าครบทั้ง Admin, Editor, Viewer ใน Object นี้
const RoleAccessLevel: Record<ApplicationRole, number> = {
    Admin: 99,
    Editor: 50,
    Viewer: 10
};

console.log("Role Access Levels:", RoleAccessLevel);
```

---

## 8. ความคงตัวของข้อมูล (Immutability & as const)
ป้องกันการแอบแก้ไขค่าโดยไม่ได้ตั้งใจ

```typescript
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const;

// HTTP_METHODS.push("PATCH"); 
// Error ทันที! เพราะ as const จะเปลี่ยนให้ Array นี้เป็น Readonly สุดขีด
// Type ของ HTTP_METHODS คือ readonly ["GET", "POST", "PUT", "DELETE"]

// หรือใช้ Readonly Utility Type กับ Object
const DefaultConfig: Readonly<{ retry: number, timeout: number }> = {
    retry: 3,
    timeout: 5000
};
// DefaultConfig.retry = 5; // Error! แก้ไขไม่ได้
console.log("Readonly Config:", DefaultConfig);
```

---

## 9. Utility Types ขั้นสูงและการจัดการ Union Type
ในงานประจำวัน เมื่อระบบใหญ่ขึ้น เราต้องยุ่งกับข้อมูลหลายรูปแบบ นี่คือตัวช่วยที่ใช้บ่อยมาก:

### 9.1 Exclude & Extract (กรองเอาเฉพาะสิ่งที่ใช่ หรือตัดทิ้งสิ่งที่ไม่เอา)
ใช้จัดการกับ **Union Types** (เช่น `A | B | C`)
```typescript
type Role = "Admin" | "Manager" | "User" | "Guest";

// Exclude: เอา Role ทั้งหมด *ยกเว้น* User และ Guest 
type BackOfficeRole = Exclude<Role, "User" | "Guest">; 
// ผลลัพธ์: "Admin" | "Manager"

// Extract: ดึงมาเฉพาะประเภทที่เราสนใจ
type FileType = "pdf" | "jpg" | "png" | "docx";
type ImageFileType = Extract<FileType, "jpg" | "png" | "gif">; 
// ผลลัพธ์: "jpg" | "png" (เพราะใน FileType มีแค่นี้ที่ตรงกัน)

const myImage: ImageFileType = "jpg";
console.log("Selected Image Type:", myImage);
```

### 9.2 ReturnType (ดึงค่า Return ของฟังก์ชันมาทำ Type)
มีประโยชน์มากเวลาที่เราใช้ไลบรารีภายนอกหรือระบบที่เขียนฟังก์ชันไว้แล้ว แต่ไม่ได้ Export Type คืนมาให้
```typescript
function getUserDetails(id: string) {
    return { id, name: "Alice", role: "Admin", isPremium: true };
}

// แตก Type ออกมาจากผลลัพธ์ของฟังก์ชันโดยตรง
type UserDetails = ReturnType<typeof getUserDetails>;

// นำมาใช้งานต่อได้เลย
function displayUser(user: UserDetails) {
    console.log("Displayed User Details:", user);
}

const fetchedUser = getUserDetails("U-555");
displayUser(fetchedUser);
```

---

## 10. `satisfies` Operator (TypeScript 4.9+)
เวลาเราตั้งค่า Config หรือ Theme บ่อยครั้งการระบุ Type ตรงๆ จะทำให้ฟีเจอร์สูญเสียความแม่นยำ (Type Narrowing หาย) หรือการใช้ `as` (Type Assertion) ก็อาจจะอันตรายเกินไปเพราะยอมให้พิมพ์ผิดได้ `satisfies` จึงเข้ามาแก้ปัญหานี้

```typescript
type UIColor = "red" | "blue" | "green" | [number, number, number];

// ถ้าใช้ Type ตรงๆ แบบนี้ เราจะเสียความแม่นยำไป (theme.primary มองว่าเป็น UIColor กว้างๆ)
// const theme: Record<string, UIColor> = { ... } 

const theme = {
    primary: "red",
    secondary: "blue",
    background: [255, 255, 255]
} satisfies Record<string, UIColor>;

// TypeScript รู้ทันทีว่า background เป็น Array และใช้งานเมธอด map ได้ 
// (ถ้าใช้ Record ตรงๆ จะ Error เพราะระบบเผื่อใจว่าอาจจะเป็น string)
const bg = theme.background.map(c => c / 255);

// ป้องกันการพิมพ์ค่าผิด: ถ้าใส่ primary: "yellow" (ซึ่งไม่มีใน UIColor) จะแจ้ง Error ทันที!

console.log("Theme configuration:", theme);
console.log("Calculated background array:", bg);
```

---

## 11. Custom Type Guards (`is` keyword)
บ่อยครั้งที่ข้อมูลมาจาก API หรือ Library เราไม่แน่ใจว่ามันเป็นรูปแบบไหนกันแน่ (เช่น สำเร็จ หรือ ล้มเหลว) การใช้เครื่องหมาย `is` จะช่วยให้เราสร้างฟังก์ชันเช็ค Type ข้อมูลที่เป็นระเบียบมากๆ

```typescript
interface SuccessResponse { data: string[]; status: 200; }
interface ErrorResponse { message: string; statusCode: 400 | 500; }

type ApiResponse = SuccessResponse | ErrorResponse;

// สังเกตที่คืนค่าเป็น `res is ErrorResponse`
function isError(res: ApiResponse): res is ErrorResponse {
    // เช็คว่า object ตัวนี้มีฟิลด์ statusCode หรือไม่
    return (res as ErrorResponse).statusCode !== undefined;
}

function handleApiCall(response: ApiResponse) {
    if (isError(response)) {
        // ในบล็อกนี้ TypeScript จะรับรู้ว่า Response คือ ErrorResponse แบบ 100%
        console.error("Failed:", response.message, "Code:", response.statusCode);
    } else {
        // ส่วนรันปกตินี้ Response จะกลายเป็น SuccessResponse อัตโนมัติ (Type Narrowing ทำงานลึกระดับฟังก์ชัน)
        console.log("Success:", response.data.join(', '));
    }
}

const mockSuccess: ApiResponse = { status: 200, data: ["item1", "item2"] };
const mockError: ApiResponse = { statusCode: 500, message: "Internal Error" };

console.log("Calling API with Success Mock:");
handleApiCall(mockSuccess);

console.log("Calling API with Error Mock:");
handleApiCall(mockError);
```

---

## 12. Template Literal Types (การสร้าง String แบบมีเงื่อนไข)
ใช้สร้าง Type ของ String จำนวนมหาศาลจากเงื่อนไขสั้นๆ เหมาะกับการทำ Design System หรือ Event Handlers ที่ต้องการความเป๊ะของชื่อ Property 

```typescript
type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

// นำมาผสมกันแบบ String Interpolation ได้ 9 รูปแบบทันที
type ButtonType = `${ButtonVariant}-${ButtonSize}`;
// ผลลัพธ์: "primary-sm" | "primary-md" | "primary-lg" | "secondary-sm" | ...

// แบบแอดวานซ์ ดัดแปลงชื่อ Event Handler ใน Object ตามชื่อโมเดล
type Entity = "User" | "Product" | "Order";

// สร้าง Format "on[Name]Change" อัตโนมัติ
type Listeners = {
    [K in Entity as `on${K}Change`]: (newValue: string) => void;
};

/* ผลลัพธ์ที่ได้จาก Listeners ข้างต้น:
{
    onUserChange: (newValue: string) => void;
    onProductChange: (newValue: string) => void;
    onOrderChange: (newValue: string) => void;
}
*/

const mockBtn: ButtonType = "danger-lg";
console.log("Selected Button Type:", mockBtn);

const appListeners: Listeners = {
    onUserChange: (val) => console.log("User changed:", val),
    onProductChange: (val) => console.log("Product changed:", val),
    onOrderChange: (val) => console.log("Order changed:", val)
};

appListeners.onProductChange("New Keyboard");
```

---

## 13. Mapped Types (การวนซ้ำเพื่อปรับเปลี่ยนคำนิยามโครงสร้างข้อมูล)
Mapped Types เปรียบเสมือนการใช้การวนลูป (Loop) ในระดับของการกำหนดโครงสร้าง (Type) เพื่อสร้างรูปเเบบใหม่โดยอ้างอิงจากคุณสมบัติของ Object เดิม มักใช้ในการปรับเปลี่ยนประเภทของ Value ทุกตัวใน Object หรือการเพิ่ม/ลบข้อจำกัดต่างๆ เช่น Optional หรือ Readonly อย่างครอบคลุม

**ตัวอย่างการประยุกต์ใช้งานด้านการออกแบบ (Design Pattern):**
ในกรณีที่เรามี Model `UserProfile` และจำเป็นต้องสร้าง Frontend UI สำหรับ "ตั้งค่าการเปิดเผยข้อมูล" (Privacy Settings) โดยรักษาฟิลด์อ้างอิงเดิมไว้ทั้งหมด แต่ต้องการเปลี่ยนประเภทข้อมูลทุกตัวให้เป็นรูปแบบ `boolean` เพื่อการจัดการสถานะของ Checkbox

เราสามารถใช้กลไกของ Mapped Type ในการจัดการเพื่อลดความซ้ำซ้อนของการประกาศตัวแปรได้ดังนี้:

```typescript
// 1. กำหนดรูปแบบและโครงสร้างข้อมูลพื้นฐาน
interface UserProfile {
    username: string;
    age: number;
    skills: string[];
    role: string;
}

// 2. การสร้าง Mapped Type ด้วยไวยากรณ์ [K in keyof T]
// คำอธิบาย: วนลูปอ่านค่า Key ทั้งหมด (K) ที่ปรากฏในชนิดข้อมูล (T) และเปลี่ยนประเภท Value เดิมให้กลายเป็น boolean
type FlagSettings<T> = {
    [K in keyof T]: boolean; 
};

// 3. การเรียกใช้งาน (Type Instantiation)
type UserPrivacyForm = FlagSettings<UserProfile>;

/* โครงสร้างเชิงตรรกะที่ระบบประมวลผลให้โดยปริยาย:
type UserPrivacyForm = {
    username: boolean;
    age: boolean;
    skills: boolean;
    role: boolean;
}
*/

// สามารถส่งต่อให้ระบบจัดการ State บริหารจัดการค่าต่างๆ ต่อไปได้อย่างรัดกุมและปลอดภัย
const privacyState: UserPrivacyForm = {
    username: true,  
    age: false,      
    skills: true,    
    role: false      
};

console.log("Mapped Type State (privacyState):", privacyState);
```

**เทคนิคขั้นสูง: การจัดการ Modifier ผ่านทิศทางควบคุมเครื่องหมายลบ (`-`)**
นอกจากฟังก์ชันการวนซ้ำแล้ว Mapped Types ยังรองรับการปรับแต่งคุณลักษณะ (Modifiers) เช่น Optional (`?`) หรือ `readonly` ควบคู่กัน โดยนักพัฒนาสามารถใช้เครื่องหมายลบ (`-`) เพื่อ "ถอดถอน" สถานะเหล่านั้นออกจาก Type เป้าหมายได้

```typescript
// โครงสร้างที่ถูกจำกัดอย่างเข้มงวดด้วย Readonly และ Optional
interface DatabaseConfig {
    readonly host?: string;
    readonly port?: number;
}

// การใช้ "-readonly" เพื่อถอดถอนข้อจำกัดการป้องกันการแก้ไข
// การใช้ "-?" เพื่อบังคับให้ฟิลด์ดังกล่าวจำเป็นต้องถูกประกาศตัวแปรเสมอ
type UnlockedConfig<T> = {
    -readonly [K in keyof T]-?: T[K]; // 'T[K]' คือการสืบทอด Value ของชนิดเดิมไว้
};

type OpenConfig = UnlockedConfig<DatabaseConfig>;

/* ผลลัพธ์เชิงโครงสร้าง: เลิกใช้ข้อจำกัดดั้งเดิมและบังคับใช้ค่าอย่างตรงไปตรงมา
type OpenConfig = {
    host: string;
    port: number;
}
*/

const config: OpenConfig = {
    host: "localhost",
    port: 5432
};

console.log("Unlocked Config:", config);
```

---

## สรุปแนวทางการเขียน Clean Architecture ด้วย TypeScript
การเรียนรู้และนำปัจจัยทั้งหมดเหล่านี้มาประกอบกัน ทำให้เราสามารถสร้างฟังก์ชันที่เขียนสั้นลง แต่ทำงานได้รัดกุม 

**ตัวอย่างการรวมร่าง Generics, Omit และ Immutability เข้าด้วยกัน**

```typescript
interface DatabaseRecord {
    id: string;
    createdAt: Date;
}

// ทำการสร้าง Helper Function ควบคู่กับ Generic
// ตัวอย่างนี้คือการรับข้อมูลประเภทอะไรก็ได้ (T)
// และนำมารวมร่าง (Intersection) กับ DataBaseRecord
function autoInjectDatabaseFields<T>(payload: T): T & DatabaseRecord {
    return {
        ...payload,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
    };
}

// โครงสร้างหลัก
interface Product {
    id: string; // Database สร้างให้
    createdAt: Date; // Database สร้างให้
    name: string;
    price: number;
}

// เวลาใช้งานจริงบนระดับ Application Logic 
// เราตัด id และ createdAt ออก เพื่อให้ Developer สร้างแค่ชื่อกับราคา
function createProduct(inputData: Omit<Product, 'id' | 'createdAt'>) {
    
    // เรียกใช้ฟังก์ชันเติมค่า Database ให้สมบูรณ์
    const readyProduct = autoInjectDatabaseFields(inputData);
    
    return readyProduct;
}

// ใช้งานได้สะอาด มั่นใจได้ว่าข้อมูลสมบูรณ์ 100%
const newProduct = createProduct({ name: "Mechanic Keyboard", price: 3500 });
console.log("Final Architecture Created Product:", newProduct);
```


