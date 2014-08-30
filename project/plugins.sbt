resolvers += Classpaths.typesafeResolver

resolvers += "Sonatype snapshots" at "https://oss.sonatype.org/content/repositories/snapshots/"

addSbtPlugin("com.github.mpeltonen" % "sbt-idea" % "1.6.0")

addSbtPlugin( "com.typesafe.sbt" % "sbt-start-script" % "0.10.0")