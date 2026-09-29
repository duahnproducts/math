// Icon Lucide cho các component React của phần Tự tạo bài giảng (cùng kiểu Icon.astro).
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleCheck,
  Download,
  FileUp,
  KeyRound,
  LoaderCircle,
  PencilLine,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-static';
import { svgIcon } from '../../lib/icon';

const BO_ICON = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'book-open': BookOpen,
  'circle-check': CircleCheck,
  download: Download,
  'file-up': FileUp,
  key: KeyRound,
  loader: LoaderCircle,
  'pencil-line': PencilLine,
  plus: Plus,
  'rotate-ccw': RotateCcw,
  sparkles: Sparkles,
  square: Square,
  trash: Trash2,
  'triangle-alert': TriangleAlert,
  upload: Upload,
  x: X,
} as const;

export function Icon({ ten, co = 16, lop = '' }: { ten: keyof typeof BO_ICON; co?: number; lop?: string }) {
  // SVG tĩnh đóng gói cùng web (lucide-static), không phải nội dung do máy sinh ra
  return <span className="o-icon" dangerouslySetInnerHTML={{ __html: svgIcon(BO_ICON[ten], co, lop) }} />;
}
