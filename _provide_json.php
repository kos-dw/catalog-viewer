<?php


try {
  // POSTデータ取得
  $post = json_decode(file_get_contents('php://input'), true);
  if (!$post) {
    throw new Exception("418 I'm a teapot");
  }
} catch (Exception $e) {
  echo $e->getMessage();
  exit;
}


$id_list = $post["list_of_id"];
$img_dirs = "./sample/";


$dirnames = array_map(function ($dir) {
  return basename($dir);
}, glob($img_dirs . "*", GLOB_ONLYDIR));

$json_source = [];
foreach ($id_list as $id) {
  $images = glob($img_dirs . $id . '/{*.jpg,*.jpeg,*.png,*.webp,*.svg}', GLOB_BRACE);
  array_push($json_source, [
    "imgs_id" => $id,
    "image_paths" =>  in_array($id, $dirnames) ? $images : null,
  ]);
}


echo json_encode($json_source);
