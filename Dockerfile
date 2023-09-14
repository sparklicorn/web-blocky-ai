FROM ubuntu:jammy

ARG nvm_version=0.39.5
ARG node_version=18.15.0
ARG java_version=17.0.8
ARG maven_version=3.9.4

SHELL ["/bin/bash", "--login", "-c"]

# Update and install packages
RUN apt-get update && apt-get install -y \
        curl \
        git \
        nano \
    && rm -rf /var/lib/apt/lists/*

# Install nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${nvm_version}/install.sh | bash

# Install Node and NPM via nvm
RUN . ~/.nvm/nvm.sh && source ~/.bashrc && nvm install ${node_version} && nvm use ${node_version}

# Install Java
RUN curl https://download.oracle.com/java/$(echo ${java_version} | cut -d '.' -f1)/archive/jdk-${java_version}_linux-x64_bin.tar.gz -o jdk-${java_version}.tar.gz
RUN tar -xvf jdk-${java_version}.tar.gz -C /opt/ \
    && rm jdk-${java_version}.tar.gz \
    && echo "export JAVA_HOME=/opt/jdk-${java_version}" | tee -a ~/.bashrc \
    && echo 'export PATH=$JAVA_HOME/bin:$PATH' | tee -a ~/.bashrc

# Install Maven
RUN curl https://dlcdn.apache.org/maven/maven-$(echo ${maven_version} | cut -d '.' -f1)/${maven_version}/binaries/apache-maven-${maven_version}-bin.tar.gz -o apache-maven-${maven_version}.tar.gz
RUN tar -xvf apache-maven-${maven_version}.tar.gz -C /opt/ \
    && rm apache-maven-${maven_version}.tar.gz \
    && echo "export MAVEN_HOME=/opt/apache-maven-${maven_version}" | tee -a ~/.bashrc \
    && echo 'export PATH=$MAVEN_HOME/bin:$PATH' | tee -a ~/.bashrc

ENV NVM_DIR=/root/.nvm
ENV NODE_PATH=${NVM_DIR}/versions/node/v${node_version}
ENV JAVA_HOME=/opt/jdk-${java_version}
ENV MAVEN_HOME=/opt/apache-maven-${maven_version}
ENV PATH=$JAVA_HOME/bin:$MAVEN_HOME/bin:${NODE_PATH}/bin:$PATH

COPY . .
