'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Gem,
  Shield,
  Cog,
  Target,
  Gauge,
  Flame,
  CircleDot,
  Cpu,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Info,
  Scale,
  Sparkles,
  Zap
} from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'
import { materialsData, MaterialData } from '@/utils/materials-data'

// Map icon names to Lucide elements
const iconMap = {
  Gem: <Gem size={18} />,
  Shield: <Shield size={18} />,
  Cog: <Cog size={18} />,
  Target: <Target size={18} />,
  Gauge: <Gauge size={18} />,
  Flame: <Flame size={18} />,
  CircleDot: <CircleDot size={18} />,
  Cpu: <Cpu size={18} />
}

export default function MaterialsHubPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | 'Metals' | 'Speciality'>('All')
  const [sortBy, setSortBy] = useState<'none' | 'machinability' | 'strength' | 'cost-asc' | 'cost-desc'>('none')

  // Convert map to array
  const allMaterials = useMemo(() => Object.values(materialsData), [])

  // Filter and sort logic
  const filteredMaterials = useMemo(() => {
    let result = [...allMaterials]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.grades.some((g) => g.name.toLowerCase().includes(q))
      )
    }

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter((m) => m.category === activeCategory)
    }

    // Sorting
    if (sortBy === 'machinability') {
      result.sort((a, b) => b.machinability - a.machinability)
    } else if (sortBy === 'strength') {
      result.sort((a, b) => b.strengthToWeight - a.strengthToWeight)
    } else if (sortBy === 'cost-asc') {
      result.sort((a, b) => a.relativeCost - b.relativeCost)
    } else if (sortBy === 'cost-desc') {
      result.sort((a, b) => b.relativeCost - a.relativeCost)
    }

    return result
  }, [allMaterials, searchQuery, activeCategory, sortBy])

  // Sparkline/bar visualization helper
  const renderMiniBar = (value: number, max: number = 5) => {
    return (
      <div className="flex items-center gap-1.5 w-24">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${(value / max) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/80 w-6 text-right">{value}/5</span>
      </div>
    )
  }

  return (
    <div
      data-theme="dark"
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#080c18', color: '#e8eaf0' }}
    >
      <MarketingHeader />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-12 pb-24" style={{ paddingTop: '7.5rem' }}>
        
        {/* ─── Hero Section ─── */}
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16 animate-[slide-up_0.3s_ease-out]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-semibold">
            <Zap size={14} /> Custom Material Selector
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Materials <span className="bg-gradient-to-r from-[var(--accent)] to-[#00b4d8] bg-clip-text text-transparent">Portfolio</span>
          </h1>
          
          <p className="text-base md:text-lg text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Choose from our extensive selection of metals and high-performance polymers. Filter by mechanical metrics and discover optimal grades for CNC milling, turning, and Wire EDM.
          </p>
        </div>

        {/* ─── Controls: Search & Filters ─── */}
        <div className="card border-white/[0.06] bg-opacity-40 p-5 rounded-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-4 animate-[fade-in_0.4s_ease-out]">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search materials (e.g. Aluminium, PEEK, 316)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 py-2.5 bg-[#0a0f1d] border-white/10 w-full"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
            {/* Category Toggle */}
            <div className="flex items-center bg-[#0a0f1d] p-1 rounded-lg border border-white/10">
              {(['All', 'Metals', 'Speciality'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-[var(--accent)] text-black font-bold'
                      : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  {cat === 'Speciality' ? 'Speciality / Plastics' : cat}
                </button>
              ))}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 bg-[#0a0f1d] px-3 py-1.5 rounded-lg border border-white/10">
              <SlidersHorizontal size={14} className="text-[var(--accent)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-white/90 focus:outline-none cursor-pointer"
              >
                <option value="none" className="bg-[#0a0f1d]">Sort Properties</option>
                <option value="machinability" className="bg-[#0a0f1d]">Machinability (High-Low)</option>
                <option value="strength" className="bg-[#0a0f1d]">Strength (High-Low)</option>
                <option value="cost-asc" className="bg-[#0a0f1d]">Cost (Low-High)</option>
                <option value="cost-desc" className="bg-[#0a0f1d]">Cost (High-Low)</option>
              </select>
            </div>
          </div>

        </div>

        {/* ─── Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="card-hover flex flex-col justify-between border-white/[0.06] bg-opacity-35 p-6 rounded-2xl relative overflow-hidden animate-[slide-up_0.3s_ease-out]"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
                    {iconMap[material.iconName]}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full border border-[var(--accent)]/15">
                    {material.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{material.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-3 mt-2 leading-relaxed">
                    {material.description}
                  </p>
                </div>

                {/* Technical Mini Specs */}
                <div className="space-y-2 border-t border-white/[0.06] pt-3">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Machinability</span>
                    {renderMiniBar(material.machinability)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Strength / Weight</span>
                    {renderMiniBar(material.strengthToWeight)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Cost Grade</span>
                    <span className="text-xs font-bold text-white">
                      {'$'.repeat(Math.round(material.relativeCost))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-5 mt-auto">
                <Link
                  href={`/materials/${material.slug}`}
                  className="w-full btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-white/10 text-white/95"
                  style={{ textDecoration: 'none' }}
                >
                  Explore Details
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}

          {filteredMaterials.length === 0 && (
            <div className="col-span-full card border-white/5 py-16 text-center text-[var(--text-muted)] animate-[fade-in_0.3s_ease-out]">
              <Info size={32} className="mx-auto text-[var(--accent)] mb-3 opacity-60" />
              <p className="text-sm font-semibold">No materials match your search or filter configuration.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('All')
                  setSortBy('none')
                }}
                className="mt-4 text-xs font-bold text-[var(--accent)] underline hover:text-[#00b4d8] cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* ─── Materials Comparison Matrix ─── */}
        {filteredMaterials.length > 0 && (
          <div className="space-y-6 animate-[fade-in_0.5s_ease-out]">
            <div className="flex items-center gap-2">
              <Scale size={20} className="text-[var(--accent)]" />
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Technical Comparison Matrix</h2>
            </div>
            
            <div className="card border-white/[0.06] bg-opacity-30 p-0 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0b1020] border-b border-white/[0.08]">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Material</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Category</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Machinability</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Strength/Weight</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Corrosion Res.</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Relative Cost</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Primary Alloys</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredMaterials.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <Link href={`/materials/${m.slug}`} className="font-bold text-white hover:text-[var(--accent)] transition-colors" style={{ textDecoration: 'none' }}>
                            {m.name}
                          </Link>
                        </td>
                        <td className="p-4 text-sm text-[var(--text-secondary)]">{m.category}</td>
                        <td className="p-4 text-sm font-semibold text-white">{m.machinability}/5</td>
                        <td className="p-4 text-sm font-semibold text-white">{m.strengthToWeight}/5</td>
                        <td className="p-4 text-sm font-semibold text-white">{m.corrosionResistance}/5</td>
                        <td className="p-4">
                          <span className="text-sm font-bold text-[var(--accent)]">
                            {'$'.repeat(Math.round(m.relativeCost))}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {m.grades.slice(0, 3).map((g) => (
                              <span key={g.name} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                                {g.name}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-[var(--text-muted)]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Speedcut. All rights reserved.
      </footer>
    </div>
  )
}
