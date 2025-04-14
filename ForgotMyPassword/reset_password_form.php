<?php
$token = $_GET['token'] ?? '';
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Nouveau mot de passe</title>
</head>
<body>
  <div class="form-container">
    <h2>Définir un nouveau mot de passe</h2>
    <form action="update_password.php" method="POST">
      <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">
      <label for="password">Nouveau mot de passe :</label>
      <input type="password" name="password" required>
      <button type="submit">Réinitialiser</button>
    </form>
  </div>
</body>
</html>
