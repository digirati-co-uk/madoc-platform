import AdmZip from 'adm-zip';
import { promises as fs, existsSync } from 'fs';
import { dirname } from 'path';
import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';

interface CsvArchiveOptions {
  outputFile: string;
  tempDir: string;
  folderPath: string;
  didError?: boolean;
  failedResources?: string[];
}

/** Publish complete bytes once, even across worker processes and duplicate status events. */
export async function publishCsvArchive(options: CsvArchiveOptions): Promise<{ empty: boolean } | undefined> {
  const { outputFile, tempDir, folderPath, didError, failedResources = [] } = options;
  if (existsSync(outputFile)) return;
  await fs.mkdir(dirname(outputFile), { recursive: true });
  // Same directory/filesystem as the destination: link is atomic and refuses replacement.
  const candidate = `${outputFile}.${generateId()}.tmp`;
  try {
    const zip = new AdmZip();
    if (didError) {
      zip.addFile(
        `${folderPath}/README-errors.txt`,
        Buffer.from(
          `This is a partial export. Some resources failed; their data may be missing.\n\n${failedResources.join('\n')}\n\nSee the failed subtasks for details. Start a fresh export to recover missing files.\n`,
          'utf-8'
        )
      );
    }
    if (existsSync(tempDir)) zip.addLocalFolder(tempDir, folderPath);
    const empty = !zip
      .getEntries()
      .some(entry => !entry.isDirectory && entry.entryName !== `${folderPath}/README-errors.txt`);
    if (empty) {
      zip.addFile(
        `${folderPath}/README.txt`,
        Buffer.from(
          'No files were generated for this export.\n\nThe selected export options may not have matched any data for the selected resources.\n',
          'utf-8'
        )
      );
    }
    await fs.writeFile(candidate, zip.toBuffer(), { flag: 'wx' });
    await fs.link(candidate, outputFile);
    return { empty };
  } catch (error) {
    // Another handler may publish and remove the input directory while we read it.
    // Its complete archive is authoritative; never rebuild/overwrite it from missing inputs.
    if (existsSync(outputFile)) return;
    throw error;
  } finally {
    await fs.rm(candidate, { force: true });
  }
}
