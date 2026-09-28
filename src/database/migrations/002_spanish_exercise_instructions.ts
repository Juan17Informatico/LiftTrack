import type { DatabaseMigration } from './types';

export const spanishExerciseInstructionsMigration: DatabaseMigration = {
  id: '002',
  name: 'spanish_exercise_instructions',
  up: `
    UPDATE exercises
    SET instructions = 'Baja la barra con control hasta el pecho y empuja hacia arriba manteniendo hombros estables.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '9b125adc-4eb6-477f-8e75-f7a22c76ac01';

    UPDATE exercises
    SET instructions = 'Empuja las mancuernas desde la parte alta del pecho con el banco inclinado.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '6d7fae87-4fe9-48c9-97f1-85494848e718';

    UPDATE exercises
    SET instructions = 'Ajusta las manijas a la altura del pecho y empuja sin bloquear fuerte los codos.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '0bc17962-3c59-402a-b07a-4c4e1c9b057b';

    UPDATE exercises
    SET instructions = 'Tira la barra hacia la parte alta del pecho llevando los codos hacia abajo y atras.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = 'efeef4fa-81d6-4a7d-9d99-2e1f2f2fcbac';

    UPDATE exercises
    SET instructions = 'Remas el agarre hacia el torso con el pecho alto y un regreso controlado.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = 'c601755a-5686-4d3d-8c0e-09d66b55d46d';

    UPDATE exercises
    SET instructions = 'Inclinate desde la cadera y rema la barra hacia las costillas bajas.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '528c1d8e-a653-4b18-a143-779ed84ea940';

    UPDATE exercises
    SET instructions = 'Flexiona los codos con los brazos cerca del torso y baja con control.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '95a6b759-13fb-4073-b6ae-0360699a40a9';

    UPDATE exercises
    SET instructions = 'Haz el curl con agarre neutro y evita balancear el torso.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = 'b2d8201d-0df8-4ed5-ad58-fdb38a1cf466';

    UPDATE exercises
    SET instructions = 'Mantiene los codos fijos y extiende los brazos hacia abajo hasta contraer el triceps.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '8b183196-1678-4c37-b463-74979b856379';

    UPDATE exercises
    SET instructions = 'Extiende desde detras de la cabeza manteniendo los codos casi fijos.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '0fd23b0f-11d4-4ee4-848a-f7ae3e1373ce';

    UPDATE exercises
    SET instructions = 'Empuja por encima de la cabeza desde la altura de hombros, con costillas abajo y munecas controladas.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = 'a2ed917f-c236-4a84-9f4d-729e69178c89';

    UPDATE exercises
    SET instructions = 'Eleva los brazos hacia los lados con una ligera flexion de codo y baja lento.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '44ff2098-68ce-4322-9d84-58b9ac5ed364';

    UPDATE exercises
    SET instructions = 'Baja la plataforma con control y empuja desde la parte media del pie.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = 'de5d23c9-a3eb-4f27-a798-97c1552fbc69';

    UPDATE exercises
    SET instructions = 'Extiende las rodillas para levantar el soporte y contrae los cuadriceps arriba.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = 'ca60b49a-9a74-482d-8d61-0e0d6926e323';

    UPDATE exercises
    SET instructions = 'Flexiona la rodilla llevando el soporte hacia el cuerpo y controla el regreso.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '3e2c7075-733d-4c9a-a144-04cbe83d5027';

    UPDATE exercises
    SET instructions = 'Haz bisagra hasta sentir estiramiento en femorales y sube llevando la cadera al frente.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = 'b4b6070f-00ff-4ccc-a146-c9852f745f19';

    UPDATE exercises
    SET instructions = 'Empuja la cadera hacia arriba desde el banco y pausa al extender completamente.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '46f8a0c0-c3ff-4c44-8c1d-58c7cfc8a1b2';

    UPDATE exercises
    SET instructions = 'Sube sobre la punta de los pies, pausa brevemente y baja hasta estirar.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '9f1eead5-fb14-4d55-8f36-c852dba1e81a';

    UPDATE exercises
    SET instructions = 'Flexiona el tronco para hacer el crunch contra la resistencia de la polea.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = '5551da0b-0d6c-4e03-b0e4-28b508d41046';

    UPDATE exercises
    SET instructions = 'Mantiene una linea recta de cabeza a talones mientras contraes el core.',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id = 'c1f63af5-bacc-4642-855f-a8d7258bcd32';
  `,
};

