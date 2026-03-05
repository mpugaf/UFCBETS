-- Update image_path for fighters missing correct values
-- Fixes fighter_id=1 (was '1.jpg', now 'alexpereira.jpg') and all NULL entries

UPDATE dim_fighters SET image_path = 'alexpereira.jpg'        WHERE fighter_id = 1;
UPDATE dim_fighters SET image_path = 'charlesoliveira.png'    WHERE fighter_id = 71;
UPDATE dim_fighters SET image_path = 'caioborralho.png'       WHERE fighter_id = 72;
UPDATE dim_fighters SET image_path = 'reinierderidder.png'    WHERE fighter_id = 73;
UPDATE dim_fighters SET image_path = 'robfont.png'            WHERE fighter_id = 74;
UPDATE dim_fighters SET image_path = 'raulrosasjr.png'        WHERE fighter_id = 75;
UPDATE dim_fighters SET image_path = 'drewdober.png'          WHERE fighter_id = 76;
UPDATE dim_fighters SET image_path = 'michaeljohnson.png'     WHERE fighter_id = 77;
UPDATE dim_fighters SET image_path = 'gregoryrodrigues.png'   WHERE fighter_id = 78;
UPDATE dim_fighters SET image_path = 'brunnoferreira.png'     WHERE fighter_id = 79;
UPDATE dim_fighters SET image_path = 'codygarbrandt.png'      WHERE fighter_id = 80;
UPDATE dim_fighters SET image_path = 'xiaolong.png'           WHERE fighter_id = 81;
UPDATE dim_fighters SET image_path = 'dontejohnson.png'       WHERE fighter_id = 82;
UPDATE dim_fighters SET image_path = 'duskotodorovic.png'     WHERE fighter_id = 83;
UPDATE dim_fighters SET image_path = 'rickyturcios.png'       WHERE fighter_id = 84;
UPDATE dim_fighters SET image_path = 'albertomontes.png'      WHERE fighter_id = 85;
UPDATE dim_fighters SET image_path = 'codydurden.png'         WHERE fighter_id = 86;
UPDATE dim_fighters SET image_path = 'nyamjargaltumendemberel.png' WHERE fighter_id = 87;
-- fighter_id=70 (Max Holloway) has no file in uploads/fighters/, left as NULL
