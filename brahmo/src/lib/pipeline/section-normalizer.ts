import { supabase } from '../supabase';
import { SectionAlert } from './types';

function getActToken(act: string): 'IPC' | 'CrPC' | 'IEA' | null {
  const clean = act.trim().toLowerCase();
  if (clean === 'ipc' || clean.includes('penal')) return 'IPC';
  if (clean === 'crpc' || clean.includes('criminal procedure') || clean === 'cr.p.c' || clean.includes('procedure')) return 'CrPC';
  if (clean === 'iea' || clean.includes('evidence') || clean.includes('iea')) return 'IEA';
  return null;
}

function getNewActName(token: 'IPC' | 'CrPC' | 'IEA'): string {
  if (token === 'IPC') return 'BNS';
  if (token === 'CrPC') return 'BNSS';
  return 'BSA';
}

export async function normalizeSections(text: string): Promise<{
  originalText: string;
  normalizedText: string;
  alerts: SectionAlert[];
}> {
  const { data: mappings, error } = await supabase
    .from('section_mappings')
    .select('*');

  if (error || !mappings) {
    console.error('Error loading section mappings:', error);
    return { originalText: text, normalizedText: text, alerts: [] };
  }

  const mappingMap = new Map<string, { newSection: string; newAct: string; oldAct: string; newActFull: string }>();

  for (const mapping of mappings) {
    const secMatch = mapping.old_section.match(/Section\s+([\w\(\)\.]+)/i);
    const secNum = secMatch ? secMatch[1] : '';
    const actToken = getActToken(mapping.old_act);

    if (secNum && actToken) {
      mappingMap.set(`${secNum.toUpperCase()}_${actToken}`, {
        newSection: mapping.new_section.replace(/Section\s+/i, ''),
        newAct: getNewActName(actToken),
        oldAct: mapping.old_act,
        newActFull: actToken === 'IPC' ? 'Bharatiya Nyaya Sanhita' : actToken === 'CrPC' ? 'Bharatiya Nagarik Suraksha Sanhita' : 'Bharatiya Sakshya Adhiniyam'
      });
    }
  }

  let normalizedText = text;
  const alerts: SectionAlert[] = [];

  const pluralRegex = /Sections\s+([\d\w\(\)\.,\s+and&]+?)\s+(?:of\s+(?:the\s+)?)?(IPC|Indian\s+Penal\s+Code|CrPC|Code\s+of\s+Criminal\s+Procedure|IEA|Indian\s+Evidence\s+Act|CrPc|Cr\.P\.C)\b/gi;

  const pluralReplacements: Array<{ original: string; replacement: string; alertInfo: SectionAlert[] }> = [];
  let pluralMatch;

  while ((pluralMatch = pluralRegex.exec(normalizedText)) !== null) {
    const originalFull = pluralMatch[0];
    const listStr = pluralMatch[1];
    const actStr = pluralMatch[2];
    const actToken = getActToken(actStr);

    if (actToken) {
      const sectionNumRegex = /\b\d+[\w\(\)\.]*\b/g;
      let secNumMatch;
      const secNums: string[] = [];
      while ((secNumMatch = sectionNumRegex.exec(listStr)) !== null) {
        secNums.push(secNumMatch[0]);
      }

      const mappedParts: string[] = [];
      const currentAlerts: SectionAlert[] = [];
      let convertedCount = 0;

      for (const num of secNums) {
        const key = `${num.toUpperCase()}_${actToken}`;
        const mapping = mappingMap.get(key);
        if (mapping) {
          mappedParts.push(mapping.newSection);
          currentAlerts.push({
            oldSection: `Section ${num} ${actToken}`,
            newSection: `Section ${mapping.newSection} ${mapping.newAct}`,
            oldAct: mapping.oldAct,
            newAct: mapping.newActFull,
            reason: 'REPEALED'
          });
          convertedCount++;
        } else {
          mappedParts.push(num);
        }
      }

      if (convertedCount > 0) {
        const newAct = getNewActName(actToken);
        let listReplacement = '';
        if (mappedParts.length === 1) {
          listReplacement = `Section ${mappedParts[0]} ${newAct}`;
        } else {
          const allButLast = mappedParts.slice(0, -1).join(', ');
          const last = mappedParts[mappedParts.length - 1];
          listReplacement = `Sections ${allButLast} and ${last} ${newAct}`;
        }

        pluralReplacements.push({
          original: originalFull,
          replacement: listReplacement,
          alertInfo: currentAlerts
        });
      }
    }
  }

  for (const r of pluralReplacements) {
    normalizedText = normalizedText.replace(r.original, r.replacement);
    alerts.push(...r.alertInfo);
  }

  const singularRegex = /Section\s+([\w\(\)\.]+)\s+(?:of\s+(?:the\s+)?)?(IPC|Indian\s+Penal\s+Code|CrPC|Code\s+of\s+Criminal\s+Procedure|IEA|Indian\s+Evidence\s+Act|CrPc|Cr\.P\.C)\b/gi;
  let singularMatch;
  const singularReplacements: Array<{ original: string; replacement: string; alert: SectionAlert }> = [];

  while ((singularMatch = singularRegex.exec(normalizedText)) !== null) {
    const originalFull = singularMatch[0];
    const secNum = singularMatch[1];
    const actStr = singularMatch[2];
    const actToken = getActToken(actStr);

    if (actToken) {
      const key = `${secNum.toUpperCase()}_${actToken}`;
      const mapping = mappingMap.get(key);
      if (mapping) {
        const replacement = `Section ${mapping.newSection} ${mapping.newAct}`;
        singularReplacements.push({
          original: originalFull,
          replacement,
          alert: {
            oldSection: originalFull,
            newSection: replacement,
            oldAct: mapping.oldAct,
            newAct: mapping.newActFull,
            reason: 'REPEALED'
          }
        });
      }
    }
  }

  for (const r of singularReplacements) {
    if (normalizedText.includes(r.original)) {
      normalizedText = normalizedText.replace(r.original, r.replacement);
      alerts.push(r.alert);
    }
  }

  const uniqueAlerts: SectionAlert[] = [];
  const seenAlertKeys = new Set<string>();

  for (const alert of alerts) {
    const key = `${alert.oldSection}->${alert.newSection}`;
    if (!seenAlertKeys.has(key)) {
      seenAlertKeys.add(key);
      uniqueAlerts.push(alert);
    }
  }

  return {
    originalText: text,
    normalizedText,
    alerts: uniqueAlerts
  };
}