import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Friend, FriendStatus } from '../../types';
import Button from '../ui/Button';
import AddFriendModal from './AddFriendModal';

const FriendRow: React.FC<{ friend: Friend }> = ({ friend }) => {
    const { acceptFriendRequest, removeFriend } = useGame();

    const ActionButtons: React.FC = () => {
        switch (friend.status) {
            case FriendStatus.FRIEND:
                return <Button variant="secondary" className="px-3 py-1 text-sm !bg-hp/20 text-hp" onClick={() => removeFriend(friend.id)}>Remove</Button>;
            case FriendStatus.PENDING_IN:
                return (
                    <div className="flex gap-2">
                        <Button variant="secondary" className="px-3 py-1 text-sm !bg-xp/80" onClick={() => acceptFriendRequest(friend.id)}>Accept</Button>
                        <Button variant="secondary" className="px-3 py-1 text-sm !bg-hp/20" onClick={() => removeFriend(friend.id)}>Decline</Button>
                    </div>
                );
            case FriendStatus.PENDING_OUT:
                return <Button variant="secondary" className="px-3 py-1 text-sm" disabled>Sent</Button>;
            default:
                return null;
        }
    };
    
    return (
        <div className="flex items-center p-3 bg-primary rounded-lg">
            <div className="relative">
                <img src={friend.avatarUrl} alt={friend.name} className="w-12 h-12 rounded-full" />
                {friend.status === FriendStatus.FRIEND && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-primary bg-green-400"></span>
                )}
            </div>
            <div className="flex-1 ml-4">
                <p className="font-bold text-white">{friend.name}</p>
                <p className="text-sm text-text-secondary">Level {friend.level}</p>
            </div>
            <ActionButtons />
        </div>
    );
};


const FriendsTab: React.FC = () => {
    const { friends } = useGame();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const friendList = friends.filter(f => f.status === FriendStatus.FRIEND);
    const pendingList = friends.filter(f => f.status === FriendStatus.PENDING_IN);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl text-accent">Your Friends</h2>
                <Button onClick={() => setIsAddModalOpen(true)}>Add Friend</Button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {pendingList.length > 0 && (
                    <div>
                        <h3 className="font-bold text-text-secondary text-sm mb-2">Incoming Requests</h3>
                        <div className="space-y-3">
                            {pendingList.map(friend => <FriendRow key={friend.id} friend={friend} />)}
                        </div>
                    </div>
                )}
                 <div>
                    <h3 className="font-bold text-text-secondary text-sm mb-2">Friends ({friendList.length})</h3>
                    <div className="space-y-3">
                        {friendList.map(friend => <FriendRow key={friend.id} friend={friend} />)}
                         {friendList.length === 0 && pendingList.length === 0 && (
                            <p className="text-center text-text-secondary py-8">Your friends list is empty. Add a friend to start your journey together!</p>
                        )}
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <AddFriendModal 
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}
        </div>
    );
};

export default FriendsTab;