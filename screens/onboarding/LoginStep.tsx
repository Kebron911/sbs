import React from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface Props {
  onNext: () => void;
}

const LoginStep: React.FC<Props> = ({ onNext }) => {
  return (
    <Card title="Account Setup" className="text-center animate-fade-in">
      <p className="text-text-secondary mb-8">
        Secure your progress by linking an account, or start your adventure as a guest. Your data is synced securely.
      </p>
      <div className="space-y-4 max-w-sm mx-auto">
        <Button className="w-full">Sign Up with Email</Button>
        <Button variant="secondary" className="w-full">Continue with Google</Button>
        <button onClick={onNext} className="text-sm text-accent hover:underline mt-4 font-bold">
          Continue as Guest
        </button>
      </div>
    </Card>
  );
};

export default LoginStep;
