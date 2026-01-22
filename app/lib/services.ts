
import { FileText, ShieldCheck, Calculator, Briefcase, BarChart, Package } from "lucide-react";

export type ServiceCode = 'AC' | 'AUD' | 'ATS' | 'CON' | 'INV' | 'OTHER';

export interface EvaluatedFramework {
    id: string;
    label: string;
    templateFile?: string;
}

export interface ServiceDefinition {
    id: ServiceCode;
    name: string;
    description: string;
    subTypes?: EvaluatedFramework[]; // For AUD (NBC TA 800 vs 4400 vs 200-700)
    defaultTemplate: string;
    icon: any;
    fields: string[];
}

export const SERVICES: Record<ServiceCode, ServiceDefinition> = {
    'AC': {
        id: 'AC',
        name: 'Auditoria Condominial',
        description: 'Auditoria de Prestação de Contas (NBC TA 800 + 4400).',
        defaultTemplate: 'template_ac_premium.docx',
        icon: ShieldCheck,
        fields: ['pages', 'folders', 'start_date', 'end_date']
    },
    'AUD': {
        id: 'AUD',
        name: 'Auditoria (Geral)',
        description: 'Auditorias contábeis e financeiras diversas.',
        subTypes: [
            { id: 'NBC_TA_800', label: 'NBC TA 800 (Quadros Isolados)', templateFile: 'template_aud_800.docx' },
            { id: 'NBC_TA_200_700', label: 'NBC TA 200-700 (Demonstrações Completas)', templateFile: 'template_aud_200_700.docx' },
            { id: 'NBC_TSC_4400', label: 'NBC TSC 4400 (Procedimentos Acordados)', templateFile: 'template_tsc_4400.docx' }
        ],
        defaultTemplate: 'template_aud_generic.docx',
        icon: FileText,
        fields: ['framework', 'scope_details', 'start_date', 'end_date']
    },
    'ATS': {
        id: 'ATS',
        name: 'Auditoria Terceiro Setor',
        description: 'ONGs, Fundações e Associações.',
        defaultTemplate: 'template_ats.docx',
        icon: Calculator,
        fields: ['project_name', 'grant_value', 'start_date']
    },
    'CON': {
        id: 'CON',
        name: 'Consultoria & Valuation',
        description: 'Consultoria Financeira, Valuation, BPO.',
        defaultTemplate: 'template_consultoria.docx',
        icon: Briefcase,
        fields: ['consultancy_type', 'hours_estimated', 'consultant_name']
    },
    'INV': {
        id: 'INV',
        name: 'Inventário',
        description: 'Contagem e avaliação de estoques/ativos.',
        defaultTemplate: 'template_inventario.docx',
        icon: Package,
        fields: ['location', 'category', 'team_size']
    },
    'OTHER': {
        id: 'OTHER',
        name: 'Outros Serviços',
        description: 'Personalizado / Novos Modelos.',
        defaultTemplate: 'template_generic.docx',
        icon: Settings, // Will need import
        fields: ['custom_title', 'custom_scope']
    }
};

import { Settings } from "lucide-react"; 
