import type { PrismaClient } from "../src/generated/prisma/client";

const IT_CLUB_ORG_ID = "org-it-club";

const EQUIPMENT_SEED = [
  {
    id: "eq-cb-204",
    assetTag: "CB-204",
    name: "Lenovo 100e Chromebook",
    category: "CHROMEBOOK" as const,
    status: "AVAILABLE" as const,
    location: "IT Office — Cart A",
    serialNumber: "SN-CB-204-8841",
    notes: "Grade 9 loaner pool",
  },
  {
    id: "eq-cb-205",
    assetTag: "CB-205",
    name: "Lenovo 100e Chromebook",
    category: "CHROMEBOOK" as const,
    status: "CHECKED_OUT" as const,
    location: "Room 108",
    serialNumber: "SN-CB-205-8842",
    notes: "Checked out for presentation",
  },
  {
    id: "eq-cb-206",
    assetTag: "CB-206",
    name: "Lenovo 100e Chromebook",
    category: "CHROMEBOOK" as const,
    status: "AVAILABLE" as const,
    location: "IT Office — Cart A",
    serialNumber: "SN-CB-206-8843",
  },
  {
    id: "eq-cb-207",
    assetTag: "CB-207",
    name: "Lenovo 100e Chromebook",
    category: "CHROMEBOOK" as const,
    status: "REPAIR" as const,
    location: "IT Repair Bench",
    serialNumber: "SN-CB-207-8844",
    notes: "Keyboard replacement pending",
  },
  {
    id: "eq-cart-01",
    assetTag: "LC-01",
    name: "Laptop Cart — Room 214",
    category: "LAPTOP_CART" as const,
    status: "AVAILABLE" as const,
    location: "Room 214",
    notes: "30-bay charging cart",
  },
  {
    id: "eq-proj-108",
    assetTag: "PRJ-108",
    name: "Epson PowerLite Projector",
    category: "PROJECTOR" as const,
    status: "AVAILABLE" as const,
    location: "Room 108 — ceiling mount",
    serialNumber: "EP-108-2201",
  },
  {
    id: "eq-proj-mobile",
    assetTag: "PRJ-M01",
    name: "Mobile Projector Kit",
    category: "PROJECTOR" as const,
    status: "CHECKED_OUT" as const,
    location: "Broadcasting Studio",
    serialNumber: "EP-M01-3390",
    notes: "Includes HDMI cable and remote",
  },
  {
    id: "eq-cam-01",
    assetTag: "CAM-01",
    name: "Canon Vixia HD Camcorder",
    category: "CAMERA" as const,
    status: "AVAILABLE" as const,
    location: "Broadcasting Studio",
    serialNumber: "CV-01-7712",
    notes: "Morning announcements kit",
  },
  {
    id: "eq-cam-02",
    assetTag: "CAM-02",
    name: "GoPro Hero Kit",
    category: "CAMERA" as const,
    status: "AVAILABLE" as const,
    location: "IT Office — Media Shelf",
    serialNumber: "GP-02-1190",
  },
  {
    id: "eq-mic-01",
    assetTag: "MIC-01",
    name: "Shure SM58 Vocal Mic",
    category: "MICROPHONE" as const,
    status: "AVAILABLE" as const,
    location: "Broadcasting Studio",
    serialNumber: "SM58-4401",
  },
  {
    id: "eq-mic-02",
    assetTag: "MIC-02",
    name: "Wireless Lavalier Set",
    category: "MICROPHONE" as const,
    status: "AVAILABLE" as const,
    location: "Broadcasting Studio",
    serialNumber: "WL-02-8820",
  },
  {
    id: "eq-nt-12",
    assetTag: "NT-12",
    name: "Network Cable Tester",
    category: "OTHER" as const,
    status: "AVAILABLE" as const,
    location: "IT Office — Tool Drawer",
    serialNumber: "NT-12-001",
    notes: "Fluke LinkRunner",
  },
  {
    id: "eq-switch-01",
    assetTag: "SW-01",
    name: "8-Port Managed Switch",
    category: "OTHER" as const,
    status: "AVAILABLE" as const,
    location: "IT Office — Lab Bench",
    serialNumber: "SW-01-4420",
    notes: "Networking lab spare",
  },
  {
    id: "eq-cb-retired",
    assetTag: "CB-101",
    name: "Acer C720 Chromebook",
    category: "CHROMEBOOK" as const,
    status: "RETIRED" as const,
    location: "Storage — E-waste bin",
    serialNumber: "SN-CB-101-2200",
    notes: "End of life — parts only",
  },
  {
    id: "eq-tripod-01",
    assetTag: "TRP-01",
    name: "Manfrotto Video Tripod",
    category: "OTHER" as const,
    status: "AVAILABLE" as const,
    location: "Broadcasting Studio",
    notes: "Pairs with CAM-01",
  },
] as const;

export async function seedEquipment(prisma: PrismaClient): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { slug: "it-club" },
    select: { id: true },
  });

  const organizationId = org?.id ?? IT_CLUB_ORG_ID;

  for (const item of EQUIPMENT_SEED) {
    await prisma.equipmentItem.upsert({
      where: { assetTag: item.assetTag },
      update: {
        name: item.name,
        category: item.category,
        status: item.status,
        location: item.location,
        serialNumber: item.serialNumber ?? null,
        notes: item.notes ?? null,
        organizationId,
      },
      create: {
        id: item.id,
        assetTag: item.assetTag,
        name: item.name,
        category: item.category,
        status: item.status,
        location: item.location,
        serialNumber: item.serialNumber ?? null,
        notes: item.notes ?? null,
        organizationId,
      },
    });
  }

  console.log(`Seeded ${EQUIPMENT_SEED.length} equipment items for IT Club.`);
}
