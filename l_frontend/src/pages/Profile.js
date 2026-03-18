export default function Profile({ user }) {
  return (
   <div className="center-card-container">

      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>

        <p><strong>Name:</strong> {user.full_name?.toUpperCase()}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role?.toUpperCase()}</p>
      </div>
    </div>
  );
}
