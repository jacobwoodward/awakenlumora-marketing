FROM nginx:1.27-alpine
# Apex -> www redirect + static serving config
COPY default.conf /etc/nginx/conf.d/default.conf
# Site content only (not the Dockerfile/conf themselves)
COPY index.html /usr/share/nginx/html/index.html
COPY assets /usr/share/nginx/html/assets
COPY free-lessons /usr/share/nginx/html/free-lessons
EXPOSE 80
