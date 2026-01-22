
"use client";

import { useState } from "react";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { SERVICES, ServiceCode, EvaluatedFramework } from "@/app/lib/services";

export default function TemplatesPage() {
    const [uploading, setUploading] = useState<string | null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, string>>({});

    async function handleUpload(file: File, targetFilename: string, key: string) {
        if (!file) return;
        setUploading(key);

        const { data, error } = await supabase.storage
            .from('templates')
            .upload(targetFilename, file, {
                upsert: true
            });

        setUploading(null);

        if (error) {
            alert("Erro ao enviar: " + error.message);
            setStatusMap(prev => ({ ...prev, [key]: 'error' }));
        } else {
            setStatusMap(prev => ({ ...prev, [key]: 'success' }));
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="px-8 py-6 bg-white border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Gerenciar Templates</h1>
                <p className="text-slate-500 text-sm">Faça o upload dos arquivos DOCX para cada modelo de serviço.</p>
            </header>

            <div className="flex-1 overflow-auto p-8">
                <div className="grid gap-6">
                    {Object.entries(SERVICES).map(([code, def]) => (
                        <div key={code} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                                <def.icon className="text-blue-600" size={20} />
                                <div>
                                    <h3 className="font-bold text-slate-800">{def.name}</h3>
                                    <p className="text-xs text-slate-500">{def.description}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Default Template */}
                                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-slate-400" size={24} />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Template Padrão</p>
                                            <p className="text-xs font-mono text-slate-400">{def.defaultTemplate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {statusMap[`${code}_default`] === 'success' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Check size={14} /> Enviado</span>}
                                        <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm">
                                            {uploading === `${code}_default` ? <Loader2 className="animate-spin" size={16} /> : 'Upload DOCX'}
                                            <input
                                                type="file"
                                                accept=".docx"
                                                className="hidden"
                                                onChange={(e) => e.target.files && handleUpload(e.target.files[0], def.defaultTemplate, `${code}_default`)}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* SubTypes Templates */}
                                {def.subTypes?.map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors ml-8 relative before:absolute before:left-[-20px] before:top-1/2 before:w-[20px] before:h-[2px] before:bg-slate-200">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-slate-400" size={24} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{sub.label}</p>
                                                <p className="text-xs font-mono text-slate-400">{sub.templateFile}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {statusMap[`${code}_${sub.id}`] === 'success' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Check size={14} /> Enviado</span>}
                                            <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm">
                                                {uploading === `${code}_${sub.id}` ? <Loader2 className="animate-spin" size={16} /> : 'Upload DOCX'}
                                                <input
                                                    type="file"
                                                    accept=".docx"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files && sub.templateFile && handleUpload(e.target.files[0], sub.templateFile, `${code}_${sub.id}`)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
