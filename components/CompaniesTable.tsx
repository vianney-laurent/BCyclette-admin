'use client'

import Link from 'next/link'
import { Company } from '@/types'
import { Building2, Users, Euro, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CompaniesTableProps {
  companies: Company[]
}

export default function CompaniesTable({ companies }: CompaniesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
              Entreprise
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
              Budget FMD
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
              Employés
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
              Créée le
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company.id}
              className="border-b border-border hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">
                      {company.name}
                    </div>
                    <div className="text-sm text-text-tertiary">
                      {company.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 text-text-primary">
                  <Euro className="w-4 h-4 text-text-tertiary" />
                  <span className="font-semibold">
                    {company.fmd_budget_per_year.toFixed(2)}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 text-text-primary">
                  <Users className="w-4 h-4 text-text-tertiary" />
                  <span>{company.employee_count}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-text-secondary text-sm">
                {format(new Date(company.created_at), 'dd MMM yyyy', { locale: fr })}
              </td>
              <td className="py-4 px-4">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/companies/${company.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm font-semibold"
                  >
                    Voir
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
