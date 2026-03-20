-- AlterTable: add is_built_in to svg_templates
ALTER TABLE "svg_templates" ADD COLUMN IF NOT EXISTS "is_built_in" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "process_svg_attachments" (
    "id" TEXT NOT NULL,
    "process_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_svg_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "process_svg_attachments_process_id_idx" ON "process_svg_attachments"("process_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "process_svg_attachments_process_id_template_id_key" ON "process_svg_attachments"("process_id", "template_id");

-- AddForeignKey
ALTER TABLE "process_svg_attachments" ADD CONSTRAINT "process_svg_attachments_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_svg_attachments" ADD CONSTRAINT "process_svg_attachments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "svg_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
