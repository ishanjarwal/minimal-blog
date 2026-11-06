import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_TAGS = [
  { name: "Linux", slug: "linux" },
  { name: "Systems", slug: "systems" },
  { name: "Kernel", slug: "kernel" },
  { name: "Agentic AI", slug: "agentic-ai" },
  { name: "LLM", slug: "llm" },
  { name: "Architecture", slug: "architecture" },
  { name: "WebSockets", slug: "websockets" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Networking", slug: "networking" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Database", slug: "database" },
  { name: "DevOps", slug: "devops" },
];

const SEED_POSTS = [
  {
    slug: "understanding-linux-memory-management",
    title: "Understanding Linux Virtual Memory & Page Cache Internals",
    shortDescription:
      "A deep-dive analysis of Linux page tables, memory overcommit heuristics, swap mechanics, and zero-copy I/O optimizations for high-throughput distributed systems.",
    content: `## Introduction to Virtual Memory

In modern operating systems, applications do not access physical memory directly. Instead, every process operates within its own private virtual address space managed by the **Memory Management Unit (MMU)** and the Linux kernel.

### The Page Table Hierarchy

x86-64 uses a 4-level (and increasingly 5-level) page table hierarchy to translate 48-bit virtual addresses into physical addresses:

- **PGD** (Page Global Directory)
- **P4D** (Page 4th Directory - used in 5-level paging)
- **PUD** (Page Upper Directory)
- **PMD** (Page Middle Directory)
- **PTE** (Page Table Entry)

\`\`\`c
// Simplified representation of virtual to physical address mapping
uintptr_t virt_to_phys(uintptr_t vaddr, struct mm_struct *mm) {
    pgd_t *pgd = pgd_offset(mm, vaddr);
    p4d_t *p4d = p4d_offset(pgd, vaddr);
    pud_t *pud = pud_offset(p4d, vaddr);
    pmd_t *pmd = pmd_offset(pud, vaddr);
    pte_t *pte = pte_offset_map(pmd, vaddr);
    return (pte_pfn(*pte) << PAGE_SHIFT) | (vaddr & ~PAGE_MASK);
}
\`\`\`

### Page Cache & Zero-Copy I/O

When an application calls \`read()\` or \`write()\`, data flows through the Linux page cache. To avoid expensive double-buffering between kernel space and user space, high-performance systems utilize \`sendfile()\` or \`io_uring\`:

| Syscall | Context Switches | Buffer Copies | Use Case |
|---|---|---|---|
| \`read()\` / \`write()\` | 2 per buffer | 2 (Disk -> Kernel -> User) | General File I/O |
| \`mmap()\` | 1 on setup | 0 (Shared pages) | Database buffer pools |
| \`sendfile()\` | 1 | 0 (Disk -> Socket directly) | Static asset servers |

### Conclusion

Tuning kernel parameters such as \`vm.swappiness\` and \`vm.dirty_ratio\` allows distributed storage nodes to sustain high ingestion write throughput without unexpected I/O stalls.`,
    thumbnailUrl:
      "https://res.cloudinary.com/dsf4t9wmc/image/upload/v1793573698/AI-Focused_Product_Engineer_Banner_pnc70e.png",
    published: true,
    publishedAt: new Date("2026-11-06T10:00:00.000Z"),
    readTimeMinutes: 6,
    tags: ["linux", "systems", "kernel"],
  },
  {
    slug: "building-resilient-agentic-reasoning-loops",
    title: "Building Resilient Agentic AI Reasoning Loops with Subagent Oracles",
    shortDescription:
      "Architectural lessons from productionizing multi-agent workflows: dealing with hallucination budgets, deterministic error back-propagation, and dynamic context pruning.",
    content: `## The Fragility of Monolithic LLM Chains

Single-pass LLM prompts degrade quickly when handling complex, multi-step problem solving. To build reliable autonomous assistants, we transition from simple prompting to structured **state machines** and **subagent delegation**.

### Subagent Topology

Instead of letting a single agent manage tool execution, planning, and code generation simultaneously, we partition responsibilities:

1. **Planner Agent**: Evaluates objectives and builds an immutable execution graph.
2. **Worker Agents**: Isolated agents executing focused tools within branched workspaces.
3. **Oracle / Verifier**: Evaluates output criteria against unit tests before returning control.

\`\`\`typescript
interface AgentState {
  objective: string;
  history: Message[];
  retriesRemaining: number;
  workspacePath: string;
}

async function executeLoop(state: AgentState): Promise<ExecutionResult> {
  while (state.retriesRemaining > 0) {
    const decision = await planner.evaluate(state);
    if (decision.type === "complete") {
      return verifier.validate(decision.artifact);
    }
    state = await worker.execute(decision.action, state);
  }
  throw new Error("Reasoning budget exhausted");
}
\`\`\`

### Context Pruning & Compaction

LLM context saturation causes "attention sink" problems. By summarizing tool logs at task boundaries and preserving only explicit structural diffs, agents can run for hours without losing focus.`,
    thumbnailUrl: null, // Conditionally omitted
    published: true,
    publishedAt: new Date("2026-10-28T14:30:00.000Z"),
    readTimeMinutes: 8,
    tags: ["agentic-ai", "llm", "architecture"],
  },
  {
    slug: "designing-type-safe-real-time-protocols",
    title: "Designing Type-Safe Real-Time WebSocket Protocols with Binary Payloads",
    shortDescription:
      "Exploring Protobuf and MessagePack serialization patterns over raw WebSockets to achieve sub-millisecond roundtrips in collaborative canvas software.",
    content: `## Why JSON Over WebSockets Fails at Scale

While JSON is accessible and human-readable, transmitting 60 updates per second per collaborator across hundreds of canvas shapes creates severe garbage collection pauses and network serialization overhead.

### Protocol Comparison

\`\`\`typescript
// Binary packet encoding schema
export interface CanvasPointerPacket {
  userId: number; // uint32
  seq: number;    // uint32
  x: number;      // float32
  y: number;      // float32
  pressure: number; // uint8
}
\`\`\`

Using MessagePack or raw ArrayBuffers reduces payload sizes by **65% to 80%**, and eliminates JSON parsing overhead on the main browser thread.`,
    thumbnailUrl: null, // Conditionally omitted
    published: true,
    publishedAt: new Date("2026-10-15T09:15:00.000Z"),
    readTimeMinutes: 5,
    tags: ["websockets", "typescript", "networking"],
  },
  {
    slug: "zero-downtime-database-migrations-in-production",
    title: "Zero-Downtime PostgreSQL Schema Migrations: The Expand and Contract Pattern",
    shortDescription:
      "Strategies for safely adding, renaming, and deprecating database columns in high-load production databases without locking tables or degrading read latency.",
    content: `## The Pitfall of Direct Column Renaming

Running \`ALTER TABLE users RENAME COLUMN email TO contact_email;\` on a table with millions of rows acquires an \`ACCESS EXCLUSIVE\` lock, queuing all incoming read and write transactions and causing application timeouts.

### The Expand & Contract Pattern

1. **Expand**: Add the new nullable column \`contact_email\`.
2. **Dual-Write**: Update application code to write to both \`email\` and \`contact_email\`.
3. **Backfill**: Incrementally backfill historic records in batches using cursor pagination.
4. **Contract**: Switch reads to \`contact_email\`, cease writing to \`email\`, and safely drop the old column.`,
    thumbnailUrl:
      "https://res.cloudinary.com/dsf4t9wmc/image/upload/v1793573698/AI-Focused_Product_Engineer_Banner_pnc70e.png",
    published: true,
    publishedAt: new Date("2026-10-02T16:45:00.000Z"),
    readTimeMinutes: 7,
    tags: ["postgresql", "database", "devops"],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert all tags
  const tagMap = new Map<string, string>();
  for (const tag of SEED_TAGS) {
    const record = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: { name: tag.name, slug: tag.slug },
    });
    tagMap.set(tag.slug, record.id);
  }
  console.log(`✓ Seeded ${SEED_TAGS.length} tags.`);

  // Upsert all posts and relations
  for (const postData of SEED_POSTS) {
    const { tags: postTags, ...postFields } = postData;

    const post = await prisma.post.upsert({
      where: { slug: postFields.slug },
      update: postFields,
      create: postFields,
    });

    // Link tags
    for (const tagSlug of postTags) {
      const tagId = tagMap.get(tagSlug);
      if (tagId) {
        await prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId,
            },
          },
          update: {},
          create: {
            postId: post.id,
            tagId,
          },
        });
      }
    }
  }

  console.log(`✓ Seeded ${SEED_POSTS.length} posts with tag relations.`);
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
