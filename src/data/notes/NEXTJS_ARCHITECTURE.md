# Next.js Mastery: The Complete App Router Guide

เอกสารอ้างอิงและสรุปแนวคิดทั้งหมดที่จำเป็นสำหรับการเขียนโปรเจกต์ด้วย Next.js (App Router) คัดมาเฉพาะส่วนสำคัญที่ได้ใช้งานจริง พร้อมตัวอย่างโค้ดแบบ Best Practices เพื่อการนำไปปรับใช้

---

## หมวดที่ 1: สถาปัตยกรรมและหน้าต่างระบบ (Core Architecture & Routing)
ส่วนนี้มุ่งเน้นไปยังพื้นฐานการเรนเดอร์ วิธีการกำหนดขอบเขตของ Server Component และการวางโครงสร้างระบบนำทางของแอปพลิเคชัน

### 1. Server Components ปะทะ Client Components (ระบบสถาปัตยกรรมหลัก)
จุดเปลี่ยนที่ยิ่งใหญ่ของระบบ App Router คือคอมโพเนนต์ทั้งหมดจะถูกประมวลผลบนเซิร์ฟเวอร์ก่อนเสมอ (Server Components) 

**Server Component (ค่าเริ่มต้น)**
- **ข้อดี:** ทำงานรวดเร็ว, ข้อมูลถูกเตรียมพร้อมตั้งแต่ฝั่งเซิร์ฟเวอร์, ลดขนาดไฟล์ JavaScript ที่ส่งไปยังคลายเอนต์, และมีความปลอดภัยสูง สามารถดำเนินการโค้ดเพื่อเชื่อมต่อฐานข้อมูลในนี้ได้โดยไม่เปิดเผยข้อมูลออกสู่สาธารณะ

**Client Component**
- ใช้ในกรณีที่คอมโพเนนต์จำเป็นต้องมีการตอบสนองต่อผู้ใช้งาน (Interactivity) หรือจัดการสถานะ (เช่น การใช้ `useState`, `onClick`, หรือ `useEffect`)
- สามารถประกาศใช้ได้โดยการใส่คำสั่ง `"use client"` ไว้ในบรรทัดแรกสุดของไฟล์

> **แนวทางปฏิบัติ (Best Practice):** ควรแยก Client Component ไปอยู่ปลายสายสุดของโครงสร้างหน้าจอ (Leaf Node) เพื่อคงให้คอมโพเนนต์โครงสร้างหลักยังคงเป็น Server Component ซึ่งส่งผลให้แอปพลิเคชันรักษาประสิทธิภาพการแสดงผลโดยรวมได้สุงสูด

```tsx
// app/components/LikeButton.tsx
// แบ่งแยกการคลิกและสถานะออกมาเป็น Client Component แยกอิสระ
"use client";

import { useState } from "react";

export function LikeButton() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(likes + 1)}>👍 {likes}</button>;
}
```

```tsx
// app/page.tsx
// หน้าหลักยังคงเป็น Server Component เพื่อประมวลผลข้อมูลทางเซิร์ฟเวอร์ได้อย่างรวดเร็ว
import { LikeButton } from "@/components/LikeButton";

export default async function HomePage() {
  // ดึงข้อมูลทางฝั่งเซิร์ฟเวอร์โดยตรง
  const stats = await getStatsFromDB();

  return (
    <div>
      <h1>สถิติภาพรวม: {stats.views}</h1>
      <LikeButton />
    </div>
  );
}
```

### 2. โครงสร้างไฟล์และเส้นทางพื้นฐาน (Routing Concepts)
Next.js ปรับระบบการนำทางให้ใช้หลักการ File-System Routing โดยอ้างอิง "โฟลเดอร์" แทนเส้นทาง (URL Path) และใช้ชื่อไฟล์ที่เป็นไปตามมาตรฐาน (Conventions) เพื่อกำหนดหน้าที่ของเส้นทางนั้น:

- `page.tsx`: ไฟล์แสดงผลหลักของเส้นทาง (ตัวอย่าง การสร้างไฟล์ในโฟลเดอร์ `/about` จะส่งผลให้เนื้อหาแสดงในเส้นทาง `localhost:3000/about`)
- `layout.tsx`: โครงสร้างหน้าเอกสารที่ใช้ครอบเนื้อหาหลายหน้า (เช่น Navbar หรือ Sidebar) ซึ่งข้อดีคือส่วนนี้จะไม่ถูกโหลดกะพริบใหม่เมื่อมีการเปลี่ยนหน้าภายใน Layout
- `loading.tsx`: หน้าต่างแสดงผลระหว่างรอข้อมูลประมวลผล (ทำงานคู่กับคุณสมบัติ React Suspense โดยอัตโนมัติ)
- `error.tsx`: ระบบจัดการข้อผิดพลาด หากคอมโพเนนต์ทำงานผิดปกติ จะแสดงหน้าข้อผิดพลาดนี้แยกเอาไว้ โดยไม่ส่งผลกระทบต่อเว็บไซต์ในองค์รวม

```tsx
// app/dashboard/layout.tsx
// ทำหน้าที่กำหนดโครงหน้าที่มีเมนูซ้ายมือ และส่งค่าเนื้อหาไปแสดงในฝั่งพื้นที่ขวามือ
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">Dashboard Menu</aside>
      {/* เนื้อหาของ page.tsx ในเส้นทางย่อยจะสวมรอยอยู่ใน {children} */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

### 3. การสร้างหน้าแบบ Dynamic (Dynamic Routes & Search Params)
บนระบบเว็บไซต์ที่มีทรัพยากรหมุนเวียน (เช่น `/product/1` หรือ `/article/news`) เราสามารถรับพารามิเตอร์ของ URL เข้ามาสร้างเส้นทางแบบไม่ตายตัวได้

- **Dynamic Folder `[name]`**: การตั้งชื่อโฟลเดอร์ที่ครอบด้วยวงเล็บเหลี่ยม (Bracket) ช่วยให้สามารถรับค่าตัวแปรจาก URL ได้ผ่านพารามิเตอร์ที่เรียกว่า `params`
- **Query String `?name=...`**: คุณค่าพารามิเตอร์ต่อท้าย URL สามารถเข้าถึงได้อย่างเป็นระบบผ่านกลไก `searchParams`

```tsx
// app/product/[id]/page.tsx
// หน้าเพจนี้จะสวมรอยให้ครอบคลุมการโหลดข้อมูลของทุก URL ที่ต่อท้าย /product/xxx

export default async function ProductDetail({ 
  params,
  searchParams 
}: { 
  params: { id: string },
  searchParams: { tab?: string }
}) {
  // ดึงค่า ID มาใช้งาน (ตัวอย่าง: ไดัค่า "99" จากเส้นทาง /product/99)
  const product = await getProduct(params.id);
  
  // ตรวจสอบ Parameter ที่เข้ามาผ่าน URL (อาทิ /product/99?tab=reviews)
  const currentTab = searchParams.tab || 'description';

  return (
    <div>
      <h1>ข้อมูลสินค้า: {product.name} (รหัส: {params.id})</h1>
      {currentTab === 'reviews' ? <ReviewSection /> : <DescriptionSection />}
    </div>
  );
}
```

### 4. แบ่งโฟลเดอร์จัดระเบียบโดยไม่กระทบ URL (Route Groups)
ในกรณีแอปพลิเคชันมีโครงสร้างหน้าจำนวนแพร่หลาย เช่น มีฝั่งร้านหน้าบ้าน กับฝั่งหลังบ้านแอดมิน เราสามารถใช้โฟลเดอร์ชื่อใส่วงเล็บ `(group_name)` เพื่อแบ่งกรุ๊ปได้ โดยที่ URL จริงของเว็บไซต์จะถือเสมือนว่าไม่มีโฟลเดอร์นี้คั่นอยู่

```text
app/
 ├── (marketing)/         # โฟลเดอร์กลุ่มผู้ใช้ทั่วไป
 │    ├── layout.tsx      # โครงสร้างสำหรับหน้าหลักทั่วไป
 │    ├── page.tsx        # ตรงกับหน้าเว็บหน้าแรกสุด (/) 
 │    └── about/page.tsx  # ตรงกับ (/about)
 │
 └── (admin)/             # โฟลเดอร์กลุ่มผู้ดูแลระบบ
      ├── layout.tsx      # โครงสร้างสำหรับการจัดการหลังบ้าน
      └── dashboard/page.tsx # ตรงกับ (/dashboard)
```
การแบ่งเช่นนี้ช่วยอำนวยความสะดวกในการใช้งาน 2 รูปแบบ Layout ที่แยกส่วนกันโดยเด็ดขาด ภายในโปรเจกต์เดียวกัน 

---

## หมวดที่ 2: จัดการกับข้อมูลและสถานะ (Data Flow & Mutations)
หลังจากเสร็จสิ้นการวางหน้าจอ ขั้นตอนถัดไปคือการจัดการรูปแบบการดึงข้อมูลและการเขียนฟังก์ชันเพื่อโต้ตอบและเปลี่ยนแปลงข้อมูลกลับไปยังฐานระบบ

### 5. การดึงข้อมูลและระบบแคช (Data Fetching & Caching)
Next.js ปรับแต่งฟังก์ชัน `fetch` แบบดั้งเดิมโดยติดตั้งความสามารถในการบริหารและกำหนดแคชข้อมูลลึกถึงระดับ Request

- `force-cache` (ค่าเริ่มต้น): ทำการดึงและแคชข้อมูลอัตโนมัติ (Static - เหมาะสำหรับเนื้อหาบนหน้าเว็บที่ไม่เปลี่ยนแปลงบ่อย)
- `no-store`: ยกเลิกพฤติกรรมการแคชข้อมูล ดึงข้อมูลและประมวลผลใหม่ทุกครั้ง (Dynamic - เหมาะกับแสดงขัอมูลแบบเรียลไทม์)
- `revalidate: วินาที`: ทำการตั้งการจำค่าแคช และเมื่อระยะเวลาดังกล่าวพ้นไป ให้สร้างภารกิจไปทำการดึงข้อมูลมาจำค่าทับเป็นแคชล่าสุดอีกรอบตามระยะเวลา (เทคนิค ISR)

```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  // ดึงข้อมูลตลอดการเรียกและระบุให้อัปเดตแคชใหม่ในทุกๆ 60 วินาที
  const response = await fetch("https://api.example.com/products", {
    next: { revalidate: 60 },
  });

  if (!response.ok) throw new Error("ไม่สามารถทำการดึงข้อมูลสินค้ามาแสดงผลได้");

  const products = await response.json();

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### 6. การโหลดข้อมูลแบบทยอยแสดง (Streaming & Suspense)
หาหน้าจอมีส่วนผสมของการดึงข้อมูลที่ใช้ความเร็วแตกต่างกัน (เช่น "ข้อมูลพื้นฐานผู้ใช้" ใช้เวลาเพียงเล็กน้อย แต่ "ระบบประมวลผลสถิติภาพรวมเดือน" ใช้เวลาดึงนาน)
เพื่อไม่ต้องตรึงรอให้คอมโพเนนต์อื่นทำงานชะงัก สามารถใช้ `<Suspense>` เข้ามาครอบพื้นที่ที่ประมวลผลนาน ให้ส่วนหน้าประว้ติผู้ใช้ถูกแสดงผลออกมาทันทีก่อนได้อย่างอิสระ

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import RevenueChart from '@/components/RevenueChart'; // (คอมโพเนนต์ที่ดึงข้อมูลด้วยระยะเวลาหน่วงที่นาน)
import UserStats from '@/components/UserStats';       // (คอมโพเนนต์ที่ดึงให้ไว)

export default function Dashboard() {
  return (
    <main>
      <h1>หน้าแผงควบคุมหลัก</h1>
      
      {/* จะแสดงผลออกมาให้เห็นก่อนอย่างรวดเร็ว */}
      <UserStats /> 
      
      {/* จะแสดงชุดข้อความ "fallback" ระหว่างรอการประมวลผลขัอมูล และสลับหน้า Component เมื่อข้อมูลจากฐานสำเร็จ */}
      <Suspense fallback={<p>กำลังประมวลผลสถิติรายได้ กรุณารอสักครู่...</p>}>
        <RevenueChart />
      </Suspense>
    </main>
  );
}
```

### 7. Server Actions & Server Functions (เจาะลึกการทำงาน)

#### 7.1 แนวคิดและความแตกต่าง

ก่อนลงโค้ด ควรเข้าใจว่าทั้งสองคำนี้หมายถึงอะไร และแตกต่างกันอย่างไร:

| | **Server Function** | **Server Action** |
|---|---|---|
| **คืออะไร** | ฟังก์ชัน `async` ทั่วไปที่ประกาศ `"use server"` เพื่อบอกว่าโค้ดชุดนี้รันบนเซิร์ฟเวอร์เท่านั้น | Server Function ที่ถูก**ผูกเข้ากับ Form หรือ Event** (เช่น `action={fn}`) ซึ่งกระตุ้นผ่านการกระทำของผู้ใช้ |
| **เรียกได้จากที่ไหน** | Server Component, Client Component (ต้อง import), หรือ Server Action อื่น | Client Component ผ่าน Form `action` หรือ `.startTransition()` |
| **ข้อมูลที่รับ** | รับ argument ทั่วไปได้เลย | รับ `FormData` อัตโนมัติเมื่อผูกกับ `<form>` |

> **สรุปสั้น:** Server Action คือ Server Function ที่ถูกเรียกจาก Client ผ่าน HTTP Request ภายใน (Next.js จัดการ Endpoint ให้อัตโนมัติ)

#### 7.1.1 Server Function vs Traditional API (เปรียบเทียบความเข้าใจ)

เพื่อให้เข้าใจง่ายขึ้น **Server Function ก็คือ API Endpoint ที่ Next.js สร้างและจัดการให้เราโดยอัตโนมัติ**

| หัวข้อเปรียบเทียบ | API แบบดั้งเดิม (Route Handler) | Server Function / Action |
|---|---|---|
| **การเรียกใช้งาน** | `fetch('/api/user', { method: 'POST', ... })` | `createUser(data)` (เรียกเหมือนฟังก์ชันปกติ) |
| **การรับส่งข้อมูล** | ต้องจัดการ JSON.stringify / JSON.parse เอง | ส่ง Object/FormData เข้าไปได้เลย |
| **ความปลอดภัย** | ต้องเขียนระบบตรวจสอบ Token/Auth เองทุก Route | ใช้ `cookies()`, `headers()` ตรวจสอบได้ทันที |
| **Type Safety** | ต้องระบุ Type เองทั้งสองฝั่ง (Client/Server) | **Full Type Safety** (แชร์ Type กันได้ทันที) |
| **เบื้องหลัง (Network)** | เรียกไปที่ URL ที่เราตั้งไว้ | เรียกไปที่ URL ปัจจุบันด้วย HTTP POST (Internal) |

---

#### 7.2 การประกาศ `"use server"` ทำงานอย่างไร

`"use server"` เป็น React Directive ที่บอก Next.js ให้ **แยกโค้ดนี้ออกไปรันบน Server เท่านั้น** — ไม่มีวันถูก Bundle ส่งไปให้ Browser เห็น

มีสองรูปแบบการประกาศ:

**แบบที่ 1: ประกาศระดับไฟล์ (แนะนำ — เหมาะกับมีหลายฟังก์ชัน)**
```ts
// app/actions/postActions.ts
"use server"; // ← ทุกฟังก์ชัน export ในไฟล์นี้จะกลายเป็น Server Function ทั้งหมด

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(data: { title: string; content: string }) {
  await db.post.create({ data });
  revalidatePath("/posts");
  return { success: true };
}

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });
  revalidatePath("/posts");
}
```

**แบบที่ 2: ประกาศระดับฟังก์ชัน (เหมาะเมื่อฝังใน Server Component โดยตรง)**
```tsx
// app/posts/page.tsx  ← ไฟล์นี้เป็น Server Component (ไม่มี "use client")
export default function PostsPage() {

  // ประกาศ Server Action ข้างในได้เลย ไม่ต้องแยกไฟล์
  async function handleDelete(formData: FormData) {
    "use server"; // ← ประกาศเฉพาะฟังก์ชันนี้
    const id = formData.get("id") as string;
    await db.post.delete({ where: { id } });
    revalidatePath("/posts");
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value="post-123" />
      <button type="submit">ลบโพสต์</button>
    </form>
  );
}
```

> **⚠️ ข้อจำกัดสำคัญ:** ถ้าเป็น Client Component (`"use client"`) จะ **ไม่สามารถ** ประกาศ `"use server"` ภายในได้โดยตรง — ต้องแยกออกเป็นไฟล์ต่างหาก แล้ว import เข้ามา

---

#### 7.3 ผูก Server Action เข้ากับ Form (Form Action Pattern)

รูปแบบพื้นฐานที่สุด — Next.js จะส่ง `FormData` ให้โดยอัตโนมัติเมื่อ Form ถูก Submit:

```ts
// app/actions/userActions.ts
"use server";

import { revalidatePath } from "next/cache";

// signature สำหรับใช้กับ useActionState: (prevState, formData)
export async function createUser(prevState: any, formData: FormData) {
  const name  = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  // เชื่อมต่อ Database ได้โดยตรง (โค้ดส่วนนี้ไม่มีวันรั่วไปยัง Browser)
  await db.user.create({ data: { name, email } });

  revalidatePath("/users"); // บอก Next.js ให้ทำการ Re-fetch หน้า /users ใหม่
  return { success: true, message: `เพิ่มผู้ใช้ "${name}" สำเร็จแล้ว` };
}
```

```tsx
// app/users/create/page.tsx
"use client";

import { useActionState } from "react";
import { createUser } from "@/actions/userActions";

export default function CreateUserForm() {
  // useActionState(action, initialState)
  // → state   : ค่า return ล่าสุดจาก action
  // → formAction : ฟังก์ชันที่ส่งให้ form action={...}
  // → isPending  : true ขณะรอ Server ประมวลผล
  const [state, formAction, isPending] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input type="text"  name="name"  placeholder="ชื่อผู้ใช้" required />
      <input type="email" name="email" placeholder="อีเมล" required />

      <button type="submit" disabled={isPending}>
        {isPending ? "กำลังบันทึก..." : "เพิ่มผู้ใช้"}
      </button>

      {/* แสดงผลลัพธ์จาก Server */}
      {state?.error   && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">{state.message}</p>}
    </form>
  );
}
```

---

#### 7.4 เรียก Server Function แบบ Programmatic (ไม่ผ่าน Form)

บ่อยครั้งที่ต้องการเรียก Server Function จากปุ่มทั่วไป หรือหลังจาก Logic อื่นทำงานเสร็จ — สามารถเรียกได้โดยตรงเหมือนฟังก์ชันปกติ:

```ts
// app/actions/likeActions.ts
"use server";

import { revalidatePath } from "next/cache";

// รับ argument ปกติได้เลย (ไม่บังคับ FormData)
export async function toggleLike(postId: string, userId: string) {
  const existing = await db.like.findFirst({ where: { postId, userId } });

  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
  } else {
    await db.like.create({ data: { postId, userId } });
  }

  revalidatePath(`/posts/${postId}`);
  return { liked: !existing };
}
```

```tsx
// app/components/LikeButton.tsx
"use client";

import { useState, useTransition } from "react";
import { toggleLike } from "@/actions/likeActions";

export function LikeButton({ postId, userId, initialLiked }: {
  postId: string;
  userId: string;
  initialLiked: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // startTransition ป้องกัน UI กระตุก และติดตามสถานะ pending ให้
    startTransition(async () => {
      const result = await toggleLike(postId, userId); // เรียก Server Function โดยตรง
      setLiked(result.liked);
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {liked ? "❤️ ถูกใจแล้ว" : "🤍 ถูกใจ"}
    </button>
  );
}
```

> **💡 หลักการ:** ใช้ `useTransition` ทุกครั้งเมื่อเรียก Server Function จากปุ่ม — ช่วยให้ UI ไม่กระตุก และได้สถานะ `isPending` มาควบคุม Loading State

---

#### 7.5 การส่ง Argument เพิ่มเติมให้ Server Action ที่ผูกกับ Form

บางกรณีต้องการส่งค่า ID หรือข้อมูลเพิ่มเติมที่ไม่ใช่ Input ในฟอร์ม สามารถทำได้ด้วย `.bind()`:

```ts
// app/actions/postActions.ts
"use server";

export async function updatePost(postId: string, prevState: any, formData: FormData) {
  //                            ↑ bind argument    ↑ useActionState args
  const title = formData.get("title") as string;
  await db.post.update({ where: { id: postId }, data: { title } });
  revalidatePath(`/posts/${postId}`);
  return { success: true };
}
```

```tsx
// app/posts/[id]/edit/page.tsx
"use client";

import { useActionState } from "react";
import { updatePost } from "@/actions/postActions";

export default function EditPostForm({ postId }: { postId: string }) {
  // ผูก postId เข้าไปเป็น argument แรกถาวร ด้วย .bind()
  const updatePostWithId = updatePost.bind(null, postId);
  const [state, formAction, isPending] = useActionState(updatePostWithId, null);

  return (
    <form action={formAction}>
      <input type="text" name="title" defaultValue="ชื่อโพสต์เดิม" />
      <button type="submit" disabled={isPending}>บันทึกการแก้ไข</button>
    </form>
  );
}
```

---

#### 7.6 Optimistic UI — อัปเดต UI ก่อนรอ Server ตอบกลับ

เทคนิคนี้ช่วยให้ UX รู้สึกลื่นไหลมากขึ้น โดยการอัปเดต UI ให้เห็นผลทันที ก่อนที่ Server จะยืนยัน — หาก Server ผิดพลาด ค่าจะถูก Rollback อัตโนมัติ:

```tsx
// app/components/TodoItem.tsx
"use client";

import { useOptimistic, useTransition } from "react";
import { toggleTodo } from "@/actions/todoActions";

export function TodoItem({ todo }: { todo: { id: string; done: boolean; text: string } }) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(todo.done);
  const [, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticDone(!optimisticDone); // ← อัปเดต UI ทันทีเลย
      await toggleTodo(todo.id);          // ← รอ Server ทำงานเงียบๆ อยู่เบื้องหลัง
    });
  };

  return (
    <div>
      <input type="checkbox" checked={optimisticDone} onChange={handleToggle} />
      <span style={{ textDecoration: optimisticDone ? "line-through" : "none" }}>
        {todo.text}
      </span>
    </div>
  );
}
```

---

#### 7.7 การจัดการ Error ใน Server Action

Server Action ควรจัดการ Error ด้วย `try/catch` และส่งข้อความกลับในรูปแบบ Object (ไม่ใช่การ `throw`) เพื่อให้ Client Component แสดงผลได้โดยไม่ Crash:

```ts
// app/actions/safeActions.ts
"use server";

export async function safeCreateUser(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;

    // validation
    if (!email.includes("@")) {
      return { status: "error", message: "รูปแบบอีเมลไม่ถูกต้อง" };
    }

    // ตรวจสอบซ้ำใน Database
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      return { status: "error", message: "อีเมลนี้มีในระบบแล้ว" };
    }

    await db.user.create({ data: { email } });
    revalidatePath("/users");

    return { status: "success", message: "สร้างบัญชีสำเร็จแล้ว!" };

  } catch (e) {
    // กรณี Database ล่มหรือมี unexpected error
    console.error("[safeCreateUser]", e);
    return { status: "error", message: "เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง" };
  }
}
```

> **⚠️ อย่า throw Error ออกจาก Server Action** โดยตรง — เพราะจะทำให้ `error.tsx` ของ Next.js รับไป แทนที่จะแสดง Inline Error ใน Form ซึ่งมักไม่ใช่สิ่งที่ต้องการ

---

#### 7.8 สรุปภาพรวมการเลือกใช้

คำถาม: **สถานการณ์ของคุณคืออะไร?**

- **ส่งข้อมูลผ่านฟอร์ม (Form Submit)** 
  → ใช้ `Server Action` ควบคู่กับ `useActionState`
- **คลิกปุ่มหรือตอบสนอง Event ทั่วไป** 
  → เรียก `Server Function` โดยตรงภายใต้ `useTransition`
- **อยากให้ UI เปลี่ยนทันทีก่อน Server ตอบ (Optimistic UI)** 
  → เพิ่มการใช้ `useOptimistic` เข้ามาช่วย
- **ต้องแนบ ID หรือค่าพารามิเตอร์จำเพาะเข้าไปด้วย** 
  → ประยุกต์ใช้ `<action_function>.bind(null, id)` 
- **ต้องการให้ระบบอื่นหรือ Mobile App เข้ามาใช้งาน** 
  → สร้างเป็น API ด้วย `Route Handler` เช่นเดิมข้ามเรื่อง Server Action ได้เลย

#### 7.9 หลักการตัดสินใจ: Server Action vs Route Handler

หากไม่แน่ใจว่างานนี้ควรเขียนเป็น API หรือ Server Action ให้ใช้เกณฑ์นี้ตัดสินใจ:

| กรณีการใช้งาน | เลือกใช้ **Server Action** | เลือกใช้ **Route Handler (API)** |
|---|:---:|:---:|
| ส่งข้อมูลจาก Form ในหน้าเว็บ | ✅ (แนะนำ) | ❌ |
| คลิกปุ่มเปลี่ยนสถานะ (เช่น Like) | ✅ (แนะนำ) | ❌ |
| ให้แอปมือถือเรียกใช้งาน | ❌ | ✅ (จำเป็น) |
| รับ Webhook จากระบบอื่น (Stripe/LINE) | ❌ | ✅ (จำเป็น) |
| สร้างไฟล์ให้โหลด (PDF/CSV) | ❌ | ✅ |
| ต้องการความรวดเร็วในการเขียนโค้ด | ✅ | ❌ |

**กฎเหล็ก:** 
- ถ้า **"User ในเว็บเราเป็นคนทำ"** → **Server Action** 
- ถ้า **"ระบบอื่นหรือแอปอื่นเป็นคนเรียก"** → **Route Handler**

### 8. Route Handlers (สร้างเส้นทาง API)
นอกเหนือระบบ Server Actions แล้ว ทางโปรเจกต์มักจะมีความจำเป็นที่ต้องสร้าง API แบบอิสระ เพื่อรองรับระบบภายนอกอื่นๆ สามารถดำเนินการสร้างขึ้นได้ผ่านการสร้างไฟล์ชื่อ `route.ts` 

```ts
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    return NextResponse.json({ success: true, payload: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "กระบวนรับข้อมูลแบบ JSON ขัดข้อง" },
      { status: 400 }
    );
  }
}
```

---

## หมวดที่ 3: ระบบปฏิสัมพันธ์หน้าบ้าน (Frontend Interactivity)
สำหรับกลุ่มกลไกที่มุ่งเน้นเสริมประสิทธิภาพในการประมวลผลและการโต้ตอบของผู้ใช้บนฝั่งคลายเอนต์

### 9. การนำทางภายในแอปพลิเคชัน (Client Navigation Hooks)
แม้ว่าการนำทางเบื้องต้นสามารถทำได้ผ่าน `<Link>` ภายใน Server Component ได้ทันที แต่สำหรับคอมโพเนนต์ฝั่งคลายเอนต์ (เช่น การเปลี่ยนเส้นทางหลังจากการคลิกปุ่มบันทึก หรือการวิเคราะห์ตำแหน่งของเส้นทางแบบดานามิก) สามารถจัดการผ่านฟังก์ชัน Hooks เบื้องต้น:

- `useRouter()`: อำนวยความสะดวกในการเขียนสคริปต์เปลี่ยนเส้นทาง (`push`, `replace`, หรือการรีเฟรชค่าการแสดงผลฝั่งเซิร์ฟเวอร์ให้ใหม่ทันดิบ `refresh`)
- `usePathname()`: ใช้เข้าถึง URL ตำแหน่งปัจจุบัน (มักใช้งานควบคู่กับการประมวลผล CSS แสดงตำแหน่งสถานะเมนูการนำทาง)
- `useSearchParams()`: ใช้เข้าถึงชุดตัวแปรแบบ Query ท้าย URL

```tsx
// app/components/FancyButton.tsx
"use client";

// สำหรับฝั่ง Application Router ปัจจุบัน การเรียก Hook จะต้องถูก import จาก next/navigation
import { useRouter, usePathname } from 'next/navigation'; 

export default function FancyButton() {
  const router = useRouter();
  const pathname = usePathname(); 

  const handleClick = () => {
    // สมมติฐานกรณีมีกระบวนการคำนวณและบันทึกบางอย่างที่คลายเอนต์ก่อน
    console.log("บันทึกการส่งสำเร็จแล้ว ระบบจะทำการเปลี่ยนเส้นทาง...");
    router.push('/success-page');
  };

  return (
    <button 
      onClick={handleClick}
      className={pathname === '/success-page' ? 'bg-red-500' : 'bg-blue-500'}
    >
      ยืนยันการทำรายการ
    </button>
  );
}
```

### 10. การใช้คอมโพเนนต์เพื่อเพิ่มประสิทธิภาพ (Built-in Optimizations)
ด้วยชิ้นส่วนที่ทาง Next.js ระบุมาตรฐานมาให้ หากนำมาใช้อย่างแข็งขัน เว็บแอปพลิเคชันจะได้รับประโยชน์ด้านเสถียรภาพประสิทธิภาพอย่างสูง (Performance):

- `Image`: ช่วยบริหารขนาดและทรัพยากรภาพให้สอดคล้องกับขนาดจอแสดงผล แปลงเป็นฟอร์แมตฉบับ WebP และจัดการกระบวนการ Lazy Loading สเกลให้อัตโนมัติ
- `Link`: ทำหน้าที่ดึงข้อมูลเส้นทางล่วงหน้าเมื่อผู้ใช้นำเมาส์ไปวาง (Prefetching) ส่งผลให้การคลิกนำทางประมวลผลต่อเนื่องอย่างลื่นไหล เสมือนเป็น Single Page Application (SPA)
- `next/font`: จัดเก็บและโหลดการตั้งค่าชุดฟอนต์แนบเข้ามาให้พร้อมระบบ Build ป้องกันปัญหา Layout Shift (หน้าจอขยับ) และความล่าช้าจากการเรียกฟอนต์ภายนอก

```tsx
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

const interFont = Inter({ subsets: ["latin"] });

export default function Header() {
  return (
    <header className={interFont.className}>
      <nav><Link href="/dashboard">หน้าต่างควบคุม Dashboard</Link></nav>
      <Image
        src="/banner.jpg"
        alt="Promotion Banner"
        width={800}
        height={300}
        priority 
      />
    </header>
  );
}
```

---

## หมวดที่ 4: การตั้งค่า, SEO และความปลอดภัย (Config, SEO & Security)
หมวดสุดท้าย ที่จัดว่ามีความสำคัญมากเพื่อเตรียมความพร้อมระบบขึ้นโปรดักชันอย่างสมบูรณ์และเชื่อถือได้ รวมถึงเครื่องมืออรรถประโยชน์ต่างๆ

### 11. Metadata & SEO
หนึ่งกระบวนการสร้างความน่าเชื่อถือคือการตั้งค่าข้อมูลอธิบายและส่งเสริมการมองเห็นของการแบ่งปัน (SEO)

```tsx
// app/articles/[slug]/page.tsx
import { Metadata } from 'next';

// ฟังก์ชันจะประมวลผลทางเซิร์ฟเวอร์ เพื่อดึงค่ามาจัดวางโครงสร้างและเริ่มสร้างเอกสารจอภาพหลักตามลำดับ
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  
  return {
    title: `${article.title} | Developer Blog`,
    description: article.summary,
    openGraph: {
      images: [article.thumbnailUrl], 
    },
  };
}

export default function ArticlePage({ params }) {
  return <article>...</article>;
}
```

### 12. ระบบตรวจสอบและคัดกรองเบื้องต้น (Middleware)
โค้ดในไฟล์ `middleware.ts` จะกลายเป็นปราการแรกที่ต้อนรับคำขอจากผู้ใช้ หน้าที่เชิงปฎิบัติโดยหลักคือควบคุมและตรวจจับประเด็นด้านความปลอดภัยตามเส้นทาง รวบให้ตั้งเงื่อนไขจัดการ Redirect กลับไป

```ts
// middleware.ts (ตำแหน่งอยู่นอกสุดของระเบียบโครงสร้าง src)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token");

  // ประเมินผลกรณีที่ผู้ใช้งานติดต่อเข้ามายังโฟลเดอร์ /admin ทว่ายังขาดการยืนยันคีย์
  if (request.nextUrl.pathname.startsWith("/admin") && !token) {
    // กำหนดการเปลี่ยนเส้นทางตีกลับให้ไปยังหน้าจอเข้าสู่ระบบแทนที่
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // นำระบบตรวจจับมารองรับเฉพาะพื้นที่ของ /admin เพื่อไม่เพิ่มภาระที่ไม่จำเป็นกับพื้นที่ส่วนอื่นๆ
};
```

### 13. การบริหารตัวแปรเซิร์ฟเวอร์ (Environment Variables)
ในการใช้งานโปรเจกต์ Next.js การจัดการข้อระบบรหัสตัวแปรจำพ่วงต้องดำเนินโดยเคร่งคัด:

- `DB_PASSWORD=xxxx` (ตัวแปรปกติ: ตัวแปรประเภทนี้จะไม่เปิดเผยข้อมูลให้ทางโครงข่ายเบราว์เซอร์ล่วงรู้โดยเด็ดขาด ใช้งานครอบคลุมสำหรับการเก็บคีย์ยืนยันเข้าเซิร์ฟเวอร์และฐานข้อมูล)
- `NEXT_PUBLIC_API_URL=https...` (ตัวแปร Client: ข้อยกเว้นสำหรับค่าใดที่ใช้นำหน้าข้อความลักษณะดังกล่าว สิ่งนั้นจะถูกเผยเพื่อเปิดช่องให้โค้ดส่วนของ Client Components อ่านได้ (ใช้สำหรับ Google Map Key เป็นต้น)

### 14. การอ้างอิงตำแหน่งแฟ้มตำแหน่ง (Absolute Imports & Path Aliases)
เพื่อลดความซับซ้อนและการ Import ตำแหน่งแหล่งอ้างอิงไฟล์ที่มีความลึกหรือยุ่งเหยิง คุณสามารถปรับหลักการมาใช้เครื่องหมายระบุตรงอ้างอิงจากโฟลเดอร์ Root เสมอ

```tsx
// ❌ เค้าโครงอ้างอิงตัวแปรแบบเก่า อาจเสี่ยงต่อความผิดพลาดเมื่อโยกย้ายไฟล์
import Button from '../../../../components/ui/Button';

// ✅ การระบุเครื่องหมาย @ เพื่อเป็นตัวเชื่อม Path โฟลเดอร์ต้นกำเนิดตลอดการใช้งาน (Best Practice)
import Button from '@/components/ui/Button';
import { db } from '@/lib/database';
```

### 15. สรุปฟังก์ชันเสริมและฮุกอรรถประโยชน์ (Built-in Utility Functions)
นอกจากคอมโพเนนต์หลักแล้ว Next.js ยังจัดเตรียมชุดคำสั่งสำเร็จรูปแบบเจาะจง ให้นักพัฒนานำไปแทรกแซงกระบวนการทำงานต่างๆ ซึ่งมีการแบ่งการเรียกใช้งานตามตำแหน่งสถาปัตยกรรมอย่างชัดเจน:

**ฟังก์ชันสำหรับใช้งานฝั่ง Server Component**
ฟังก์ชันเหล่านี้มุ่งเน้นการจัดการข้อมูล HTTP Headers และการเปลี่ยนเส้นทางบนแวดล้อมฝั่งเซิร์ฟเวอร์:
- `headers()`: เรียกและกำหนดข้อมูล Headers จาก Request ปัจจุบัน
- `cookies()`: เรียกใช้และจัดการข้อมูล Cookies (ตัวอย่างการนำไปตรวจสอบสถานะการล็อคอินแบบรวดเร็ว)
- `notFound()`: ยกเลิกการประมวลผลหน้านั้นแบบฉับพลัน พร้อมแสดงสลับเส้นทางนำไปสู่หน้า `not-found.tsx` อัตโนมัติ (นิยมใช้เมื่อไม่พบรายการจากฐานข้อมูล)
- `redirect(path)`: คำสั่งเปลี่ยนเส้นทางไปยังเป้าหมายแบบชั่วคราว (HTTP Status 307)
- `permanentRedirect(path)`: คำสั่งเปลี่ยนเส้นทางเป้าหมายแบบถาวร (HTTP Status 308) ซึ่งส่งผลดีต่อหลักการทำ SEO

```tsx
// แนวทางการใช้งานฟังก์ชันฝั่ง Server
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';

export async function checkAccessAndFetch(id: string) {
  const cookieStore = await cookies();
  
  if (!cookieStore.has('auth_token')) {
    redirect('/login'); // เปลี่ยนเส้นทางหากยังไม่ยืนยันตัวตน
  }
  
  const data = await getSecureData(id);
  
  if (!data) {
    notFound(); // ทิ้งน้ำหนักหน้าไปสู่ 404 ทันที
  }
  
  return data;
}
```

**ฮุกสำหรับใช้งานฝั่ง Client Component (จำเป็นต้องมี `"use client"`)**
ฮุกเหล่านี้ออกแบบมาเพื่อช่วยอำนวยความสะดวกในการควบคุม URL ให้กับฝั่งหน้าเบราว์เซอร์:
- `useParams()`: สำหรับการเรียกวิเคราะห์ค่า Dynamic Route Segment Params (เช่น `[id]`)
- `usePathname()`: สำหรับการเรียกวิเคราะห์ที่อยู่ของลิงก์และพาร์ธปัจจุบัน
- `useSearchParams()`: สำหรับการเข้าถึงและแก้ไขชุดตัวแปรแบบ URL Search Params (เช่น `?page=1`)
- `useRouter()`: ใช้เพื่อเข้าถึงระบบการสลับหน้าสเกลการจัดการกว้าง (Router แบบ Programmatically)

*ศึกษาฟังก์ชันทั้งหมดเชิงลึกเพิ่มเติมของ Next.js ได้ที่ศูนย์ข้อมูลอ้างอิง: [nextjs.org/docs/app/api-reference/functions](https://nextjs.org/docs/app/api-reference/functions)*
