import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Registration, RegistrationInsert, RegistrationUpdate } from "./database.types";

export type SqlConsoleResult = {
  command: string;
  message: string;
  rows: Registration[];
};

const allowedColumns = new Set(["full_name", "email", "phone", "country_iso", "dance_location"]);
type EditableRegistrationTextColumn = "full_name" | "email" | "phone" | "country_iso" | "dance_location";
const uuidPattern = "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

const splitSqlList = (value: string) => {
  const parts: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === "'") {
      if (quoted && value[index + 1] === "'") {
        current += "''";
        index += 1;
        continue;
      }
      quoted = !quoted;
    }

    if (character === "," && !quoted) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  if (quoted) {
    throw new Error("Hay una comilla sin cerrar en la consulta.");
  }

  parts.push(current.trim());
  return parts;
};

const parseStringLiteral = (value: string) => {
  if (!/^'(?:[^']|'')*'$/.test(value.trim())) {
    throw new Error(`El valor ${value} debe ir entre comillas simples.`);
  }

  return value.trim().slice(1, -1).replaceAll("''", "'");
};

const ensureAllowedColumn = (column: string) => {
  const normalized = column.trim().toLowerCase();
  if (!allowedColumns.has(normalized)) {
    throw new Error(`La columna ${column} no se puede modificar desde esta consola.`);
  }
  return normalized as EditableRegistrationTextColumn;
};

export async function executeRegistrationSql(
  client: SupabaseClient<Database>,
  rawSql: string
): Promise<SqlConsoleResult> {
  const command = rawSql.trim().replace(/;\s*$/, "");
  if (!command) {
    throw new Error("Escribe una consulta antes de ejecutarla.");
  }

  const selectMatch = command.match(
    /^select\s+\*\s+from\s+(?:public\.)?registrations(?:\s+order\s+by\s+(full_name|email|phone|dance_location|created_at)\s+(asc|desc))?$/i
  );
  if (selectMatch) {
    const column = (selectMatch[1]?.toLowerCase() ?? "created_at") as keyof Registration;
    const ascending = (selectMatch[2]?.toLowerCase() ?? "desc") === "asc";
    const { data, error } = await client.from("registrations").select("*").order(column, { ascending });
    if (error) throw error;
    return { command: "SELECT", message: `${data.length} fila(s) devueltas.`, rows: data };
  }

  const countMatch = command.match(/^select\s+count\(\*\)\s+from\s+(?:public\.)?registrations$/i);
  if (countMatch) {
    const { count, error } = await client.from("registrations").select("*", { count: "exact", head: true });
    if (error) throw error;
    return { command: "SELECT COUNT", message: `count = ${count ?? 0}`, rows: [] };
  }

  const insertMatch = command.match(
    /^insert\s+into\s+(?:public\.)?registrations\s*\(([^)]+)\)\s*values\s*\((.+)\)$/is
  );
  if (insertMatch) {
    const columns = splitSqlList(insertMatch[1]).map(ensureAllowedColumn);
    const values = splitSqlList(insertMatch[2]).map(parseStringLiteral);
    if (columns.length !== values.length) {
      throw new Error("El número de columnas y valores no coincide.");
    }

    const row = Object.fromEntries(columns.map((column, index) => [column, values[index]])) as unknown as RegistrationInsert;
    if (!row.full_name || !row.email || !row.phone) {
      throw new Error("INSERT requiere full_name, email y phone.");
    }

    const { data, error } = await client.from("registrations").insert(row).select().single();
    if (error) throw error;
    return { command: "INSERT", message: "1 fila insertada.", rows: [data] };
  }

  const updateMatch = command.match(
    new RegExp(`^update\\s+(?:public\\.)?registrations\\s+set\\s+(.+)\\s+where\\s+id\\s*=\\s*'(${uuidPattern})'$`, "is")
  );
  if (updateMatch) {
    const updates: Partial<Record<EditableRegistrationTextColumn, string>> = {};
    splitSqlList(updateMatch[1]).forEach((assignment) => {
      const match = assignment.match(/^([a-z_]+)\s*=\s*(.+)$/i);
      if (!match) throw new Error(`Asignación no válida: ${assignment}`);
      updates[ensureAllowedColumn(match[1])] = parseStringLiteral(match[2]);
    });

    const { data, error } = await client
      .from("registrations")
      .update(updates as RegistrationUpdate)
      .eq("id", updateMatch[2])
      .select()
      .single();
    if (error) throw error;
    return { command: "UPDATE", message: "1 fila actualizada.", rows: [data] };
  }

  const deleteMatch = command.match(
    new RegExp(`^delete\\s+from\\s+(?:public\\.)?registrations\\s+where\\s+id\\s*=\\s*'(${uuidPattern})'$`, "i")
  );
  if (deleteMatch) {
    const { data, error } = await client
      .from("registrations")
      .delete()
      .eq("id", deleteMatch[1])
      .select()
      .single();
    if (error) throw error;
    return { command: "DELETE", message: "1 fila eliminada.", rows: [data] };
  }

  throw new Error(
    "Consulta no permitida. Usa SELECT, INSERT, UPDATE o DELETE sobre public.registrations siguiendo los ejemplos."
  );
}
