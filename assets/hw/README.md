# รูปถ่ายสินค้าจริง (optional)

วางไฟล์รูปสินค้าในโฟลเดอร์นี้ ตั้งชื่อไฟล์ตาม `key` ของสินค้าใน
[`src/hardware.js`](../../src/hardware.js) แล้วรัน `npm run hardware` —
เว็บจะใช้รูปจริงแทนภาพวาด SVG อัตโนมัติ (ถ้ารูปโหลดไม่สำเร็จจะ fallback
กลับเป็น SVG เอง ไม่มีภาพแตก)

- นามสกุลที่รองรับ: `.png` `.jpg` `.jpeg` `.webp` `.avif` `.svg`
- ตัวอย่าง: `rtx5090.jpg`, `r7-9800x3d.webp`, `aw3225qf.png`
- แนะนำรูปที่เห็นทั้งตัวสินค้าและกล่อง กว้าง ~600px ก็พอ (การ์ดแสดงที่ ~300px)
- ถ้าอยากใช้รูปจากเว็บโดยตรง (hotlink) ใส่ URL ในฟิลด์ `img` ของสินค้านั้น
  ใน `src/hardware.js` แทนได้ — ฟิลด์ `img` ชนะไฟล์ในโฟลเดอร์นี้

รายชื่อ key ปัจจุบัน: `rtx5090` `rtx5080` `rtx5070ti` `rtx5070` `rtx5060ti16`
`rx9070xt` `rx9070` `rtx4060` `r7-9800x3d` `r9-9950x3d` `r9-9950x` `r7-9700x`
`r5-9600x` `cu9-285k` `cu7-265k` `cu5-245k` `gskill-6000c30-64`
`gskill-6400c32-32` `corsair-6000c30-32` `kingston-5600-32` `corsair-7200-48`
`samsung-9100pro-2tb` `crucial-t705-2tb` `samsung-990pro-2tb` `wd-sn850x-2tb`
`kingston-kc3000-2tb` `crucial-p3plus-2tb` `aw3225qf` `lg-32gs95ue` `pg27ucdm`
`lg-27gr83q` `gigabyte-m27q` `aoc-24g4`
