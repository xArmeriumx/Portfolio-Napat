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

### 7. จัดการ Form ด้วย Server Actions (ไม่ต้องสร้าง API แยก)
เทคนิคนี้เป็นกลไกที่ช่วยให้สามารถเขียนและการเรียกฟังก์ชันที่ทำงานบนระดับสคริปต์ของเซิฟเวอร์ ผูกเชื่อมต่อโดยตรงจากการโต้ตอบแบบฟอร์มฝั่งคลายเอนต์ โดยลดขั้นตอนการสร้าง API แยกต่างหาก

```ts
// app/actions/userActions.ts
"use server"; // ประกาศเพื่อให้ระบบทำงานบนแวดล้อมเฉพาะฝั่งเซิร์ฟเวอร์

import { revalidatePath } from "next/cache";

export async function createUser(prevState: any, formData: FormData) {
  const email = formData.get("email");

  // ตรวจสอบความถูกต้องทางข้อมูลเบื้องต้น
  if (!email || typeof email !== "string") {
    return { error: "รูปแบบอีเมลไม่ถูกต้อง ข้อมูลขัดข้อง" };
  }

  // สมมติว่าจัดเก็บเข้า Database เรียบร้อยแล้ว (เช่น await db.user.create({ email }))

  // ส่งคำสั่งรีเฟรชเส้นทางหน้าเพจของรายชื่อผู้ใช้ให้แสดงข้อมูลใหม่ล่าสุด
  revalidatePath("/users");
  return { success: true };
}
```

สามารถนำฟังก์ชันฝั่งเซิร์ฟเวอร์มาประสานเข้ากับ UI Component ได้โดยใช้ `useActionState` ตัวช่วยในการบริหารสถานะขณะทำงานและดักจับข้อความข้อผิดพลาดกลับมา:

```tsx
// app/users/create/page.tsx
"use client";

import { useActionState } from "react";
import { createUser } from "@/actions/userActions";

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      
      <button type="submit" disabled={isPending}>
        {isPending ? "กำลังบันทึกข้อมูล..." : "เพิ่มผู้ใช้งาน"}
      </button>
      
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
    </form>
  );
}
```

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

## หมวดที่ 4: การตั้งค่า, SEO และความปลอดภัย (Config & Security)
หมวดสุดท้าย ที่จัดว่ามีความสำคัญมากเพื่อเตรียมความพร้อมระบบขึ้นโปรดักชันอย่างสมบูรณ์และเชื่อถือได้

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
