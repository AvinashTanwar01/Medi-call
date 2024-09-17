let handleMemberJoined = async (MemberId) => {
    console.log('A new member has joined the room:', MemberId);
    addMemberToDom(MemberId);

    let members = await channel.getMembers();
    updateMemberTotal(members);
    let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ['name']);

    addBotMessageToDom(`Welcome to the room ${name}! 👋`)
}

let addMemberToDom = async (MemberId) => {
    let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ['name']);

    let membersWrapper = document.getElementById('member__list');
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                      </div>`;

    membersWrapper.insertAdjacentHTML('beforeend', memberItem);
}

let updateMemberTotal = async (members) => {
    let total = document.getElementById('members__count');
    total.innerText = members.length;  // Display the total number of members
}

let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId);

    let members = await channel.getMembers();
    updateMemberTotal(members);
}

let removeMemberFromDom = async (MemberId) => {
    let membersWrapper = document.getElementById(`member__${MemberId}__wrapper`);
    let name = membersWrapper.getElementsByClassName('member_name')[0].textContent
    membersWrapper
        membersWrapper.remove();  // Remove the member from the
        
    addBotMessageToDom(`${name} has left the room.`)
}

let getMembers = async () => {
    let members = await channel.getMembers();
    updateMemberTotal(members);  // Update member count

    for (let i = 0; i < members.length; i++) {
        addMemberToDom(members[i]);
    }
}

let handleChannelMessage = async (messageData, MemberId) => {
    console.log('A new message received');
    let data = JSON.parse(messageData.text);
    
    if (data.type === 'chat') {
        addMessageToDom(data.displayName, data.message);
    }
}

let sendMessage = async (e) => {
    e.preventDefault();  // Prevent form submission

    let message = e.target.message.value;
    channel.sendMessage({ text: JSON.stringify({ 'type': 'chat', 'message': message, 'displayName': displayName }) });
    addMessageToDom(displayName, message);

    e.target.reset();  // Clear the form after sending the message
}

let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages');

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`;

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

    let lastMessage = messagesWrapper.querySelector('.message__wrapper:last-child');
    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth' });  // Smooth scrolling to the last mOTsage
    }
}
let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages');

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 MEDI BOT</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`;

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

    let lastMessage = messagesWrapper.querySelector('.message__wrapper:last-child');
    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth' });  // Smooth scrolling to the last message
    }
}

let leaveChannel = async () => {
    await channel.leave();
    await rtmClient.logout();
}

window.addEventListener('beforeunload', leaveChannel);
let messageForm = document.getElementById('message__form');
messageForm.addEventListener('submit', sendMessage);
