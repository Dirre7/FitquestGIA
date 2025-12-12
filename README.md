# FitQuest IA

Aplicación de entrenamiento gamificada potenciada por IA y Supabase.

## Configuración de Supabase

Para que la aplicación funcione correctamente y guarde el progreso de los usuarios, necesitas configurar la base de datos en Supabase.

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard).
2. Abre la sección **SQL Editor** en la barra lateral.
3. Crea una nueva consulta (New Query).
4. Copia el contenido del archivo `supabase_setup.sql` de este proyecto.
5. Pégalo en el editor y haz clic en **Run**.

Esto creará la tabla `user_progress` y configurará las políticas de seguridad necesarias para que cada usuario tenga sus datos privados.

## Desarrollo

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
