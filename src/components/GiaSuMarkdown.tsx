import { mdSangHtml } from '../lib/tu-tao/hien-thi';

export default function GiaSuMarkdown({ text }: { text: string }) {
  return <div className="van-ban" dangerouslySetInnerHTML={{ __html: mdSangHtml(text) }} />;
}
