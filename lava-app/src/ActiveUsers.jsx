import { useState, useEffect } from 'react';

// Live count from the dev server's presence plugin (presence-plugin.js).
// The offline build has no dev server, so the badge is hidden there.
export default function ActiveUsers() {
  const [presence, setPresence] = useState(null);

  useEffect(() => {
    const hot = import.meta.hot;
    if (!hot) return;
    const onPresence = data => setPresence(data);
    hot.on('lava:presence', onPresence);
    hot.send('lava:presence:hello');
    return () => hot.off('lava:presence', onPresence);
  }, []);

  if (!presence) return null;

  return (
    <div className="active-users" title={presence.users.join('\n')}>
      <span className="active-users-dot" />
      Active users: {presence.count}
    </div>
  );
}
