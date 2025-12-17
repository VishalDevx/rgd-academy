import { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";

interface LatestListProps<T> {
  title: string;
  icon?: ReactNode;
  items: T[];
  emptyText?: string;
  renderItem: (item: T) => ReactNode;
}

export function LatestList<T>({
  title,
  icon,
  items,
  emptyText = "No records found.",
  renderItem,
}: LatestListProps<T>) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map(renderItem)}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
