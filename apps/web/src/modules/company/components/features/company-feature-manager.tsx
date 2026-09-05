'use client';

import React, { useMemo, useState } from 'react';
import type { Feature } from '@repo/client';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Spinner } from '@repo/ui/components/spinner';
import { Switch } from '@repo/ui/components/switch';
import { Layers, Search, Sparkles } from 'lucide-react';
import { useCompanyFeatureToggle } from '@/modules/feature/hooks/feature-mutations';
import {
  useCompanyFeaturesQueries,
  useFeatureListQueries,
} from '@/modules/feature/hooks/feature-queries';

interface CompanyFeatureManagerProps {
  companyId: string;
}

export function CompanyFeatureManager({
  companyId,
}: CompanyFeatureManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const featuresQuery = useFeatureListQueries();
  const companyFeaturesQuery = useCompanyFeaturesQueries(companyId);
  const toggleMutation = useCompanyFeatureToggle();

  const allFeatures = useMemo<Feature[]>(
    () => featuresQuery.data || [],
    [featuresQuery.data],
  );

  const companyFeatureMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if (companyFeaturesQuery.data) {
      for (const cf of companyFeaturesQuery.data) {
        map.set(cf.featureId, cf.isEnabled);
      }
    }
    return map;
  }, [companyFeaturesQuery.data]);

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return allFeatures;
    const term = searchTerm.toLowerCase();
    return allFeatures.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.code.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term) ||
        (f.description && f.description.toLowerCase().includes(term)),
    );
  }, [allFeatures, searchTerm]);

  const groupedFeatures = useMemo(() => {
    const groups: Record<string, Feature[]> = {};
    for (const feat of filteredFeatures) {
      const cat = feat.category || 'GENERAL';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(feat);
    }
    return groups;
  }, [filteredFeatures]);

  const activeCount = useMemo(() => {
    let count = 0;
    for (const feat of allFeatures) {
      if (companyFeatureMap.get(feat.id)) {
        count++;
      }
    }
    return count;
  }, [allFeatures, companyFeatureMap]);

  const isLoading = featuresQuery.isLoading || companyFeaturesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดรายการฟีเจอร์...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Overview Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">
              สิทธิ์การเข้าถึงฟีเจอร์ของบริษัท (Feature Entitlements)
            </h4>
            <p className="text-xs text-muted-foreground">
              Super Admin สามารถเปิด/ปิดฟีเจอร์ให้บริษัทนี้ได้แบบ Real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            เปิดใช้งาน {activeCount} จากทั้งหมด {allFeatures.length} ฟีเจอร์
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <InputGroup className="w-full max-w-md">
        <InputGroupAddon align="inline-start">
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="ค้นหาฟีเจอร์ (เช่น Attendance, Payroll)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Grouped Features List */}
      {filteredFeatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Layers className="size-8 opacity-40 mb-2" />
          <p className="text-sm font-medium">ไม่พบฟีเจอร์ที่ตรงกับคำค้นหา</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groupedFeatures).map(([category, features]) => (
            <div key={category} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  หมวดหมู่: {category}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({features.length})
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {features.map((feat) => {
                  const isEnabled = companyFeatureMap.get(feat.id) ?? false;
                  const isMutatingThis =
                    toggleMutation.isPending &&
                    toggleMutation.variables?.featureId === feat.id;

                  return (
                    <Card
                      key={feat.id}
                      className={`transition-all duration-200 ${
                        isEnabled
                          ? 'border-primary/30 bg-card shadow-xs'
                          : 'border-border/60 bg-muted/20 opacity-80'
                      }`}
                    >
                      <CardContent className="p-4 flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">
                              {feat.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono px-1.5 py-0"
                            >
                              {feat.code}
                            </Badge>
                          </div>

                          {feat.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {feat.description}
                            </p>
                          )}

                          <div className="pt-1">
                            {isEnabled ? (
                              <span className="inline-flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                ● เปิดใช้งานสำหรับบริษัทนี้
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[11px] text-muted-foreground">
                                ○ ปิดการใช้งาน
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          {isMutatingThis && (
                            <Spinner className="size-3.5 text-primary animate-spin" />
                          )}
                          <Switch
                            isSelected={isEnabled}
                            isDisabled={isMutatingThis}
                            onChange={(nextVal) => {
                              toggleMutation.mutate({
                                companyId,
                                featureId: feat.id,
                                isEnabled: nextVal,
                              });
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyFeatureManager;
