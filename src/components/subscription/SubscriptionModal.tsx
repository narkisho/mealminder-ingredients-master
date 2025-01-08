import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PayPalSubscribeButton } from "./PayPalSubscribeButton";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionModal = ({ open, onOpenChange }: SubscriptionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to MealMind</DialogTitle>
          <DialogDescription>
            Get unlimited recipe generations and unlock all premium features
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <PayPalSubscribeButton />
        </div>
      </DialogContent>
    </Dialog>
  );
};