import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import { useGame } from '../../contexts/GameContext';
import { Character, FriendStatus } from '../../types';
import Button from '../ui/Button';
import DynamicAvatar from '../character/DynamicAvatar';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose }) => {
    const { users, friends, character, addFriend } = useGame();
    const [searchTerm, setSearchTerm] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return users.filter(user =>
            user.id !== character.id &&
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users, character.id]);

    const getFriendStatus = (userId: string) => {
        const friend = friends.find(f => f.id === userId);
        if (friend) {
            if (friend.status === FriendStatus.FRIEND) return 'Already Friends';
            if (friend.status === FriendStatus.PENDING_OUT) return 'Request Sent';
            if (friend.status === FriendStatus.PENDING_IN) return 'Incoming Request';
        }
        return 'Add';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add a Friend">
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Search by player name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-primary border border-border-color rounded-full px-4 py-2 text-sm"
                />
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {searchResults.map(user => {
                        const status = getFriendStatus(user.id);
                        return (
                             <div key={user.id} className="flex items-center p-2 bg-primary rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-background overflow-hidden flex-shrink-0">
                                    <DynamicAvatar appearance={user.appearance} equipment={user.equipment} />
                                </div>
                                <div className="flex-1 ml-3">
                                    <p className="font-bold text-white">{user.name}</p>
                                    <p className="text-sm text-text-secondary">Level {user.level}</p>
                                </div>
                                <Button
                                    variant="secondary"
                                    className="px-3 py-1 text-sm"
                                    onClick={() => addFriend(user.id)}
                                    disabled={status !== 'Add'}
                                >
                                    {status}
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Modal>
    );
};

export default AddFriendModal;