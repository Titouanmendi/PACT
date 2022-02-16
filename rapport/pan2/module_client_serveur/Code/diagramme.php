<p>Vous avez choisi la version <?php echo $_GET['numero']; ?> </p>
<?php
/*if ($_GET['entree'] == 1) {
    header("Content-type: image/jpeg");
    $img = imagecreatefromjpeg('images/architecture.jpg');
    imagejpeg($img);
}
if ($_GET['entree'] == 2) {
    header("Content-type: image/png");
    $img = imagecreatefrompng('images/diagramme.png');
    imagepng($img);
}
if ($_GET['entree'] == 3) {
    header("Content-type: image/png");
    $img = imagecreatefrompng('images/diagramme_v2.png');
    imagepng($img);
} 

header('Content-type:image/jpg');
$image = 'image/diagramme' . $_GET['numero'] . 'jpg';
imagejpeg(imagecreatefromjpeg($image)); */
?>

<?php
$image = "images/diagramme" . $_GET["numero"] . ".jpg";
echo $image;
echo '<img src = $image>'; ?>