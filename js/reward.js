function registerPostReward() {
    const button = document.querySelector('.reward-container button');
    if (!button) return;
    button.addEventListener('click', () => {
        document.querySelector('.post-reward').classList.toggle('active');
    });
}
registerPostReward();