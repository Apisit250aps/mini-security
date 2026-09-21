'use client';

import React, { useState } from 'react';
import type { LeaveRequest } from '@repo/domains/entities';
import { calculateLeaveDays } from '@repo/domains';
import { formatDateRange, formatDate } from '@/shared/utils/date';
import { useLeaveRequestReview } from '../../hooks/leave-mutations';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Textarea } from '@repo/ui/components/textarea';
import { Label } from '@repo/ui/components/label';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Paperclip,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

interface LeaveRequestDetailSheetProps {
  request: LeaveRequest;
  organizationId: string;
  leaveTypeName?: string;
  memberName?: string;
  onClose: () => void;
}

export default function LeaveRequestDetailSheet({
  request,
  organizationId,
  leaveTypeName = 'การลา',
  memberName,
  onClose,
}: LeaveRequestDetailSheetProps) {
  const [reviewNote, setReviewNote] = useState('');
  const reviewMutation = useLeaveRequestReview(organizationId);

  const daysCount = calculateLeaveDays({
    startDate: request.startDate,
    endDate: request.endDate,
    unit: request.unit,
  });

  const handleReview = (action: 'approved' | 'rejected') => {
    reviewMutation.mutate(
      {
        id: request.id,
        data: {
          action,
          reviewNote: reviewNote.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge
            variant="default"
            className="gap-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="size-3" />
            อนุมัติแล้ว
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="size-3" />
            ปฏิเสธ
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="size-3" />
            ยกเลิกแล้ว
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-400 text-amber-600"
          >
            <Clock className="size-3" />
            รอพิจารณา (Pending)
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Top Status & Employee Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {memberName || 'พนักงาน'}
            </h3>
            <p className="text-xs text-muted-foreground">{leaveTypeName}</p>
          </div>
        </div>
        <div>{getStatusBadge(request.status)}</div>
      </div>

      {/* Date & Duration Card */}
      <Card className="border-border/70 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <span>ช่วงวันที่ลา:</span>
            </div>
            <span className="font-medium text-foreground">
              {formatDateRange(request.startDate, request.endDate)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span>จำนวนวันลาทั้งหมด:</span>
            </div>
            <Badge
              variant="secondary"
              className="font-semibold text-foreground"
            >
              {daysCount} วันทำการ
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reason Card */}
      <div className="flex flex-col gap-2">
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <FileText className="size-3.5" />
          เหตุผลการลา
        </Label>
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 text-sm text-foreground">
          {request.reason || 'ไม่ได้ระบุเหตุผล'}
        </div>
      </div>

      {/* Attachment if present */}
      {request.proofUrl && (
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Paperclip className="size-3.5" />
            เอกสารแนบประกอบ
          </Label>
          <a
            href={request.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border/70 p-3 text-sm text-primary transition-colors hover:bg-muted/50"
          >
            <Paperclip className="size-4 shrink-0" />
            <span className="truncate">คลิกเพื่อดูเอกสารแนบ</span>
          </a>
        </div>
      )}

      {/* Review Section */}
      {request.status === 'pending' ? (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
          <Label
            htmlFor="review-note"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
          >
            <MessageSquare className="size-3.5" />
            ความเห็นหรือหมายเหตุจากผู้อนุมัติ (Optional)
          </Label>
          <Textarea
            id="review-note"
            placeholder="ระบุเหตุผลเพิ่มเติมหรือคำแนะนำประกอบการพิจารณา..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onPress={onClose}
              isDisabled={reviewMutation.isPending}
            >
              ปิดหน้าต่าง
            </Button>
            <ButtonLoading
              variant="destructive"
              isLoading={reviewMutation.isPending}
              onPress={() => handleReview('rejected')}
            >
              <XCircle className="size-4" />
              ปฏิเสธคำขอ
            </ButtonLoading>
            <ButtonLoading
              isLoading={reviewMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onPress={() => handleReview('approved')}
            >
              <CheckCircle2 className="size-4" />
              อนุมัติคำขอ
            </ButtonLoading>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <MessageSquare className="size-3.5" />
            ผลการพิจารณาคำขอ
          </Label>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 text-sm">
            {request.reviewNote ? (
              <p className="text-foreground">{request.reviewNote}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                ไม่มีความเห็นเพิ่มเติม
              </p>
            )}
            {request.reviewedAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                พิจารณาเมื่อ: {formatDate(request.reviewedAt)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
