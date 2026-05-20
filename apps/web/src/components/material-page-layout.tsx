'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Gem,
  Shield,
  Cog,
  Target,
  Gauge,
  Flame,
  CircleDot,
  Cpu,
  CheckCircle,
  FileText,
  HelpCircle,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'
import { MaterialData } from '@/utils/materials-data'

// Map icon names to Lucide elements
const iconMap = {
  Gem: <Gem className="text-[var(--accent)]" size={24} />,
  Shield: <Shield className="text-[var(--accent)]" size={24} />,
  Cog: <Cog className="text-[var(--accent)]" size={24} />,
  Target: <Target className="text-[var(--accent)]" size={24} />,
  Gauge: <Gauge className="text-[var(--accent)]" size={24} />,
  Flame: <Flame className="text-[var(--accent)]" size={24} />,
  CircleDot: <CircleDot className="text-[var(--accent)]" size={24} />,
  Cpu: <Cpu className="text-[var(--accent)]" size={24} />
}

interface MaterialPageLayoutProps {
  material: MaterialData
}

export function MaterialPageLayout({ material }: MaterialPageLayoutProps) {
  const [activeGradeTab, setActiveGradeTab] = useState(0)

  // Circular gauge rendering helper
  const renderGauge = (label: string, value: number, max: number = 5, formatCost: boolean = false) => {
    const radius = 24
    const circumference = 2 * Math.PI * radius
    const percentage = value / max
    const strokeDashoffset = circumference * (1 - percentage)

    return (
      <div className="flex flex-col items-center p-5 card rounded-xl bg-opacity-30 border-opacity-10 text-center flex-1 min-w-[140px] animate-[slide-up_0.3s_ease-out]">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Background track */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-[var(--border)]"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Active track with glow */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-[var(--accent)] transition-all duration-1000 ease-out"
              strokeWidth="4.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0px 0px 3px var(--accent))'
              }}
            />
          </svg>
          {/* Internal Value */}
          <div className="absolute text-sm font-bold text-[#fff]">
            {formatCost ? '$'.repeat(Math.round(value)) : `${value}/${max}`}
          </div>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-3">
          {label}
        </span>
      </div>
    )
  }

  const activeGrade = material.grades[activeGradeTab] || material.grades[0]

  return (
    <div
      data-theme="dark"
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#080c18', color: '#e8eaf0' }}
    >
      <MarketingHeader />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-12 pb-20" style={{ paddingTop: '7.5rem' }}>
        
        {/* ─── Breadcrumbs ─── */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-6 animate-[fade-in_0.3s_ease-out]">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/materials" className="hover:text-white transition-colors">Materials</Link>
          <span>/</span>
          <span className="text-[var(--accent)] font-bold">{material.name}</span>
        </div>

        {/* ─── Hero / Header Section ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-6 animate-[slide-up_0.3s_ease-out]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-bold uppercase tracking-wider">
              {iconMap[material.iconName]}
              {material.category}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Precision <span className="bg-gradient-to-r from-[var(--accent)] to-[#00b4d8] bg-clip-text text-transparent">{material.name}</span> Machining
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed">
              {material.longDescription}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {material.processes.map((proc) => (
                <span
                  key={proc}
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-white/5 border border-white/10 text-white/90"
                >
                  {proc}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="lg:col-span-4 card bg-gradient-to-b from-[#11182c] to-[#0a0f1d] border-white/[0.06] p-6 rounded-2xl flex flex-col space-y-6 lg:mt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)] border-b border-white/[0.08] pb-3 flex items-center gap-2">
              <Activity size={16} /> Mechanical Assessment
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {renderGauge('Machinability', material.machinability)}
              {renderGauge('Strength/Weight', material.strengthToWeight)}
              {renderGauge('Corrosion Res.', material.corrosionResistance)}
              {renderGauge('Relative Cost', material.relativeCost, 5, true)}
            </div>
          </div>

        </div>

        {/* ─── Body Section (Specs, Grades, DFM) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Grade Tabs & Applications */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Grade Showcase */}
            <div className="card border-white/[0.06] p-6 rounded-2xl space-y-6 bg-opacity-40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Supported Alloys & Grades</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Select a grade below to view its precise chemical & mechanical specs.</p>
                </div>
                
                {/* Tabs Select */}
                <div className="flex flex-wrap gap-1.5 bg-[#0a0f1d] p-1 rounded-lg border border-white/[0.06]">
                  {material.grades.map((grade, idx) => (
                    <button
                      key={grade.name}
                      onClick={() => setActiveGradeTab(idx)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        activeGradeTab === idx
                          ? 'bg-[var(--accent)] text-black shadow-md'
                          : 'text-[var(--text-muted)] hover:text-white'
                      }`}
                    >
                      {grade.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Grade Data */}
              <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0a0f1d] border border-white/[0.04] rounded-xl">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                      Yield Strength
                    </div>
                    <div className="text-lg font-bold text-white">
                      {activeGrade.yieldStrength}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[#0a0f1d] border border-white/[0.04] rounded-xl">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                      Hardness
                    </div>
                    <div className="text-lg font-bold text-white">
                      {activeGrade.hardness}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-[var(--accent)]" /> Material Capability Note
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-white/[0.01] p-4 rounded-xl border border-white/[0.02]">
                    {activeGrade.description}
                  </p>
                </div>
              </div>

            </div>

            {/* Practical Applications */}
            <div className="card border-white/[0.06] p-6 rounded-2xl bg-opacity-40 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--accent)]" /> Typical Industrial Applications
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Due to its outstanding mechanical traits, our customers regularly design {material.name.toLowerCase()} parts for the following applications:
              </p>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {material.applications.map((app) => (
                  <li key={app} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: DFM Guidelines */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* DFM Specifications Card */}
            <div className="card border-white/[0.06] p-6 rounded-2xl bg-opacity-40 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-4">
                <FileText size={18} className="text-[var(--accent)]" /> Machining DFM Guidelines
              </h3>
              
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Min Wall Thickness
                  </h4>
                  <p className="text-sm font-semibold text-white">
                    {material.dfm.minWallThickness}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Thinner walls can cause excessive deflection, vibrations, or dimensional warping.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Min Internal Corner Radius
                  </h4>
                  <p className="text-sm font-semibold text-white">
                    {material.dfm.minCornerRadius}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Sharp internal corners are difficult to mill. Rounding corners accommodates round tool diameters.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Tapped Threads
                  </h4>
                  <p className="text-sm font-semibold text-white">
                    {material.dfm.threadCompliance}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Fully compliant with metric and imperial fastener threads.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Achievable Tolerances
                  </h4>
                  <p className="text-sm font-semibold text-white">
                    {material.dfm.tolerances}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Recommended Surface Finishes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {material.dfm.finishes.map((finish) => (
                      <span
                        key={finish}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/15"
                      >
                        {finish}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quoting Call-To-Action */}
            <div className="card-hover border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent)]/5 to-transparent p-6 rounded-2xl space-y-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-[var(--accent)]" /> Upload CAD for Instant Quoting
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Need high-quality {material.name.toLowerCase()} components? Simply drag and drop your STEP or STL files to analyze geometries, calculate dynamic material and runtime pricing, and place your order in minutes.
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/quotes/new"
                  className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 text-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Get Instant Quote
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="btn-secondary flex items-center justify-center gap-2 px-6 py-2.5 text-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Speak with an Engineer
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-[var(--text-muted)]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Speedcut. All rights reserved.
      </footer>
    </div>
  )
}
