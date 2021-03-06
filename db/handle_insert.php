<?php

require_once('config.php');

if ($_SERVER['REQUEST_METHOD'] == "POST") {
  if (isset($_POST['type'])) {

    include 'database.php';
    include 'functions.php';

    $db = new Database();
    $functions = new Functions($db);

    if ($_POST['type'] === "marker") { // Add a marker

      $functions->add_marker($_POST['latitude'], $_POST['longitude'], $_POST['name'], $_POST['marker_image'], $_POST['content_image'], $_POST['content_video'], $_POST['content_text'], $_POST['date'], $_POST['layer'], $_POST['site']);
      header("Location: /$FOLDER/admin.php");

    } else if ($_POST['type'] === "site") { // Add a site

      $functions->add_site($_POST['latitude'], $_POST['longitude'], $_POST['name'], $_POST['description'], $_POST['marker_image'], $_POST['background_image']);
      header("Location: /$FOLDER/admin.php");
    }
  }
} else {
  header("Location: /$FOLDER/index.html");
}
